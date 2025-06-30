# Exact Backend Queries for Duplicate Replicas

## Overview
This document contains the exact backend queries used in your current salon management software for creating duplicate replicas, backup operations, and data replication functionality.

## 1. Database Schema Duplication Functions

### Clean Duplicate Transactions Function
**Purpose**: Removes duplicate transactions from product_stock_transactions table
```sql
CREATE FUNCTION public.clean_duplicate_transactions() RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
  deleted_count INTEGER;
  result JSONB;
BEGIN
  -- Create a temporary table to track duplicates for deletion
  CREATE TEMP TABLE duplicate_ids (id UUID);
  
  -- Insert the IDs of duplicate records (keeping the first one)
  INSERT INTO duplicate_ids
  WITH duplicates AS (
    SELECT 
      id,
      product_id,
      quantity,
      previous_stock,
      new_stock,
      created_at,
      ROW_NUMBER() OVER (
        PARTITION BY 
          product_id,
          quantity,
          previous_stock,
          new_stock,
          DATE_TRUNC('minute', created_at)
        ORDER BY created_at
      ) as row_num
    FROM product_stock_transactions
  )
  SELECT id FROM duplicates WHERE row_num > 1;

  -- Delete the duplicates
  DELETE FROM product_stock_transactions
  WHERE id IN (SELECT id FROM duplicate_ids);
  
  -- Get the count of deleted rows
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Clean up
  DROP TABLE duplicate_ids;
  
  -- Return results
  result := jsonb_build_object(
    'success', true,
    'duplicates_removed', deleted_count
  );
  
  RETURN result;
END;
$$;
```

### Process POS Order with Duplicates Function
**Purpose**: Handles order processing while managing duplicate product entries
```sql
CREATE FUNCTION public.process_pos_order_with_duplicates() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
  service jsonb;
  product_id_text TEXT;
  product_id UUID;
  product_name TEXT;
  current_stock INTEGER;
  new_stock INTEGER;
  quantity INTEGER;
  total_quantity INTEGER;
  product_quantities JSONB := '{}'::JSONB;
BEGIN
  -- Skip if this isn't a sale or salon_consumption insertion
  IF TG_OP != 'INSERT' OR (NEW.type != 'sale' AND NEW.type != 'salon_consumption') THEN
    RETURN NEW;
  END IF;
  
  -- First pass: Aggregate product quantities
  FOR service IN SELECT * FROM jsonb_array_elements(NEW.services)
  LOOP
    IF service->>'type' = 'product' THEN
      product_id_text := service->>'product_id';
      IF product_id_text IS NULL THEN
        product_id_text := service->>'service_id';
      END IF;

      IF product_id_text IS NULL THEN
        CONTINUE;
      END IF;

      quantity := 1;
      IF service ? 'quantity' AND service->>'quantity' ~ '^[0-9]+$' THEN
        quantity := (service->>'quantity')::INTEGER;
      END IF;

      IF product_quantities ? product_id_text THEN
        product_quantities := jsonb_set(
          product_quantities,
          ARRAY[product_id_text],
          to_jsonb((product_quantities->>product_id_text)::INTEGER + quantity)
        );
      ELSE
        product_quantities := jsonb_set(
          product_quantities,
          ARRAY[product_id_text],
          to_jsonb(quantity)
        );
      END IF;
    END IF;
  END LOOP;

  -- Second pass: Update stock based on unique product entries
  FOR product_id_text IN SELECT * FROM jsonb_object_keys(product_quantities)
  LOOP
    product_id := product_id_text::UUID;

    SELECT name, stock_quantity INTO product_name, current_stock
    FROM product_master
    WHERE id = product_id;

    IF product_name IS NULL THEN
      CONTINUE;
    END IF;

    total_quantity := (product_quantities->>product_id_text)::INTEGER;
    IF total_quantity < 1 THEN
      total_quantity := 1;
    END IF;

    new_stock := GREATEST(0, current_stock - total_quantity);

    UPDATE product_master
    SET stock_quantity = new_stock,
        updated_at = NOW()
    WHERE id = product_id;

    INSERT INTO product_stock_transactions (
      id,
      product_id,
      transaction_type,
      quantity,
      previous_stock,
      new_stock,
      order_id,
      notes,
      display_type,
      source_type,
      source,
      duplicate_protection_key
    ) VALUES (
      gen_random_uuid(),
      product_id,
      'reduction',
      total_quantity,
      current_stock,
      new_stock,
      NEW.id,
      format('GROUPED: Stock reduced by %s units from %s entries', 
             total_quantity, total_quantity),
      CASE WHEN NEW.type = 'sale' THEN 'sale' ELSE 'salon_consumption' END,
      'order',
      CASE WHEN NEW.type = 'sale' THEN 'pos_sale' ELSE 'pos_salon_consumption' END,
      NEW.id || '_' || product_id || '_grouped_' || now()
    );
  END LOOP;

  RETURN NEW;
END;
$_$;
```

## 2. Database Migration Backup Queries

### Table Backup and Restoration Pattern
**Purpose**: Create temporary backups during schema migrations
```sql
-- Backup existing data
CREATE TEMPORARY TABLE IF NOT EXISTS inventory_products_backup AS 
SELECT * FROM inventory_products WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'inventory_products'
);

-- Drop existing table
DROP TABLE IF EXISTS inventory_products CASCADE;

-- Recreate table with proper schema
CREATE TABLE inventory_products (
  product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name TEXT NOT NULL,
  hsn_code TEXT,
  units TEXT,
  unit_type TEXT,
  mrp_incl_gst NUMERIC NOT NULL DEFAULT 0,
  mrp_excl_gst NUMERIC NOT NULL DEFAULT 0,
  gst_percentage NUMERIC NOT NULL DEFAULT 18,
  discount_on_purchase_percentage NUMERIC DEFAULT 0,
  stock_quantity NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restore data with proper GST calculations if backup exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'pg_temp' AND table_name = 'inventory_products_backup'
  ) THEN
    INSERT INTO inventory_products (
      product_id, product_name, hsn_code, units, 
      mrp_incl_gst, mrp_excl_gst, gst_percentage,
      discount_on_purchase_percentage, stock_quantity, status,
      created_at, updated_at
    )
    SELECT 
      product_id, product_name, hsn_code, units,
      COALESCE(mrp_incl_gst, 0) as mrp_incl_gst,
      COALESCE(mrp_excl_gst, COALESCE(mrp_incl_gst, 0) / (1 + (COALESCE(gst_percentage, 18) / 100))) as mrp_excl_gst,
      COALESCE(gst_percentage, 18) as gst_percentage,
      COALESCE(discount_on_purchase_percentage, 0), 
      COALESCE(stock_quantity, 0), 
      COALESCE(status, 'active'),
      created_at, updated_at
    FROM inventory_products_backup;
  END IF;
END $$;

-- Drop the temporary table
DROP TABLE IF EXISTS inventory_products_backup;
```

### Products Table Backup Pattern
```sql
-- Backup existing data
CREATE TEMPORARY TABLE IF NOT EXISTS products_backup AS SELECT * FROM products;

-- [Table recreation steps would go here]

-- Restore data from backup
INSERT INTO products (
  id, name, hsn_code, units, mrp_incl_gst, mrp_excl_gst, 
  gst_percentage, discount_on_purchase_percentage, stock_quantity, 
  status, created_at, updated_at
)
SELECT 
  id, name, hsn_code, units, mrp_incl_gst, mrp_excl_gst,
  gst_percentage, discount_on_purchase_percentage, stock_quantity,
  status, created_at, updated_at
FROM products_backup;

-- Clean up
DROP TABLE IF EXISTS products_backup;
```

## 3. Application-Level Data Export/Import Queries

### Export Database to JSON
**File**: `src/utils/databaseUtils.ts`
```typescript
export async function exportDatabaseToJson() {
  try {
    // Get all data from Supabase tables
    const [purchasesResult, salesResult, consumptionResult] = await Promise.all([
      supabase.from('inventory_purchases').select('*'),
      supabase.from(TABLES.SALES).select('*'),
      supabase.from('inventory_consumption').select('*')
    ]);

    // Check for errors
    if (purchasesResult.error) throw purchasesResult.error;
    if (salesResult.error) throw salesResult.error;
    if (consumptionResult.error) throw consumptionResult.error;

    return {
      purchases: purchasesResult.data || [],
      sales: salesResult.data || [],
      consumption: consumptionResult.data || [],
      exportDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error exporting database to JSON:', error);
    throw error;
  }
}
```

### Import Database from JSON Backup
```typescript
export async function importDatabaseFromJson(backupData: any) {
  try {
    if (!backupData) {
      throw new Error('No backup data provided');
    }

    // Clear existing data 
    const clearResults = await Promise.all([
      supabase.from('inventory_purchases').delete().gt('id', '0'),
      supabase.from(TABLES.SALES).delete().gt('id', '0'),
      supabase.from('inventory_consumption').delete().gt('id', '0')
    ]);
    
    // Check for errors
    clearResults.forEach(result => {
      if (result.error) throw result.error;
    });

    // Import data
    const importResults = await Promise.all([
      backupData.purchases?.length > 0 ? 
        supabase.from('inventory_purchases').insert(backupData.purchases) : 
        Promise.resolve({ data: null, error: null }),
      
      backupData.sales?.length > 0 ? 
        supabase.from(TABLES.SALES).insert(backupData.sales) : 
        Promise.resolve({ data: null, error: null }),
      
      backupData.consumption?.length > 0 ? 
        supabase.from('inventory_consumption').insert(backupData.consumption) : 
        Promise.resolve({ data: null, error: null })
    ]);

    // Check for errors
    importResults.forEach(result => {
      if (result.error) throw result.error;
    });

    return { success: true };
  } catch (error) {
    console.error('Error importing database from JSON:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

## 4. Essential Data Copy Operations

### Membership Tiers Data Copy
```sql
COPY public.membership_tiers (id, name, price, duration_months, benefits, description, created_at, updated_at) FROM stdin;
```

### Service Collections Data Copy
```sql
COPY public.service_collections (id, name, description, created_at, updated_at) FROM stdin;
```

## 5. Inventory Save API Replication Logic

**File**: `api/save-inventory.js`
```javascript
// Process products - Check if exists, update or insert new
for (const product of products) {
  try {
    // Check if product already exists
    const { data: existingProducts, error: queryError } = await supabase
      .from('products')
      .select('id')
      .eq('name', product.product_name)
      .eq('hsn_code', product.hsn_code);

    if (queryError) throw queryError;

    let productId;

    if (existingProducts && existingProducts.length > 0) {
      // Update existing product
      productId = existingProducts[0].id;
      const { error: updateError } = await supabase
        .from('products')
        .update({
          unit: product.units
        })
        .eq('id', productId);

      if (updateError) throw updateError;
    } else {
      // Insert new product
      productId = uuidv4();
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          id: productId,
          name: product.product_name,
          hsn_code: product.hsn_code,
          unit: product.units
        });

      if (insertError) throw insertError;
    }

    // Store the product ID for reference in other tables
    product.id = productId;
    results.products.success++;
  } catch (error) {
    console.error('Error processing product:', error);
    results.products.error++;
  }
}
```

## 6. Duplicate Protection Mechanisms

### Avoid Duplicate Insert Function
```sql
CREATE FUNCTION public.avoid_duplicate_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Check if a record with the same duplicate_protection_key already exists
  IF EXISTS (
    SELECT 1 FROM product_stock_transactions 
    WHERE duplicate_protection_key = NEW.duplicate_protection_key
  ) THEN
    -- If it exists, skip the insert
    RAISE NOTICE 'Duplicate transaction prevented for key: %', NEW.duplicate_protection_key;
    RETURN NULL;
  END IF;
  
  -- Otherwise, allow the insert
  RETURN NEW;
END;
$$;
```

### Unique Duplicate Protection Index
```sql
CREATE UNIQUE INDEX idx_duplicate_protection ON public.product_stock_transactions 
USING btree (duplicate_protection_key) 
WHERE (duplicate_protection_key IS NOT NULL);

CREATE UNIQUE INDEX idx_unique_duplicate_key ON public.product_stock_transactions 
USING btree (duplicate_protection_key);
```

## 7. Trigger Configuration for Duplicates

### Duplicate Prevention Triggers
```sql
-- Trigger to avoid duplicate inserts
CREATE TRIGGER trig_avoid_duplicate_insert 
BEFORE INSERT ON public.product_stock_transactions 
FOR EACH ROW EXECUTE FUNCTION public.avoid_duplicate_insert();

-- Trigger to process orders with duplicate handling
CREATE TRIGGER process_pos_order_with_duplicates_trigger 
AFTER INSERT ON public.pos_orders 
FOR EACH ROW EXECUTE FUNCTION public.process_pos_order_with_duplicates();
```

## 8. Usage Instructions

### To Clean Duplicate Transactions:
```sql
SELECT public.clean_duplicate_transactions();
```

### To Create a Complete Database Backup:
```javascript
// In your application
import { saveBackupToFile } from './src/utils/databaseUtils';
await saveBackupToFile();
```

### To Restore from Backup:
```javascript
// In your application
import { importDatabaseFromJson, loadBackupFile } from './src/utils/databaseUtils';
const backupData = await loadBackupFile();
await importDatabaseFromJson(backupData);
```

## Summary

The system uses multiple approaches for duplicate replica creation:

1. **Database Level**: SQL functions for cleaning duplicates and handling duplicate transactions
2. **Migration Level**: Temporary table creation with INSERT-SELECT patterns for data preservation
3. **Application Level**: JSON export/import functionality for complete data replication
4. **API Level**: Upsert patterns in inventory management to handle duplicate data gracefully
5. **Protection Level**: Unique constraints and triggers to prevent unwanted duplicates

The core pattern across all these is the **INSERT-SELECT** methodology combined with duplicate protection keys to ensure data integrity during replication operations.