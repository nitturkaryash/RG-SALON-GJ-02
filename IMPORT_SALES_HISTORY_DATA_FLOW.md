# Sales History Data Flow: Excel Import to Database Views

## Overview
This document explains how **current stock**, **HSN code**, and **product type** data flows from Excel import through the `AggregatedExcelImporter.tsx` component into the sales history database views.

## Data Flow Architecture

### 1. Excel Data Extraction
The `AggregatedExcelImporter.tsx` extracts the following fields from Excel:

```typescript
// From Excel row data
const hsnCode = row['hsn code'] || row['HSN CODE'] || row['HSN Code'] || row['hsn_code'] || row['HSN'] || '';
const productType = row['Typre'] || row['Type'] || row['Product Type'] || row['product_type'] || 'pcs';
const currentStock = extractCurrentStock(row); // From 'current stock' column
```

### 2. Service Data Structure
The extracted data is stored in the `ServiceData` interface:

```typescript
interface ServiceData {
  name: string;
  category: string;
  stylist: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxPercent: number;
  subtotal: number;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  type: 'service' | 'product' | 'membership';
  hsnCode?: string;           // ← HSN Code from Excel
  productType?: string;       // ← Product Type from Excel
  taxableValue?: number;
  cgst?: number;
  sgst?: number;
  currentStock?: number;      // ← Current Stock from Excel
}
```

### 3. Database Insert Structure
When importing to the database, the data is structured as follows:

```typescript
// Services array for pos_orders table
const servicesArray = order.services.map(item => {
  const baseServiceObject = {
    type: finalType,
    price: Number(item.unitPrice),
    category: finalCategory,
    hsn_code: item.hsnCode || (finalType === 'product' ? "33059040" : null),  // ← HSN Code
    quantity: Number(item.quantity),
    service_id: uuidv4(),
    service_name: item.name,
    gst_percentage: Number(item.taxPercent) || (finalType === 'product' ? 18 : 0),
    current_stock: item.currentStock !== undefined ? Number(item.currentStock) : null,  // ← Current Stock
    units: finalType === 'product' ? (item.productType || 'pcs') : null  // ← Product Type
  };
  
  if (finalType === 'product') {
    return {
      ...baseServiceObject,
      product_name: item.name,
      hsn_code: item.hsnCode || "33059040",  // ← HSN Code for products
      gst_percentage: Number(item.taxPercent) || 18,
      current_stock: item.currentStock !== undefined ? Number(item.currentStock) : null,  // ← Current Stock
      units: item.productType || 'pcs'  // ← Product Type
    };
  }
  // ... other types
});
```

### 4. Database Table Structure
The data is inserted into the `pos_orders` table with the following structure:

```sql
-- pos_orders table structure (relevant fields)
CREATE TABLE pos_orders (
  id UUID PRIMARY KEY,
  services JSONB,  -- Contains hsn_code, current_stock, units
  current_stock TEXT,  -- Consolidated stock value
  -- ... other fields
);
```

### 5. Sales History View Mapping
The sales history views (`sales_history_fin`, `sales_history_final`, etc.) extract the data:

```sql
CREATE VIEW sales_history_fin AS
WITH sales_data AS (
  SELECT 
    po.id AS order_id,
    po.date AS order_date,
    -- ... other fields
    pm.hsn_code,                    -- ← HSN Code from product_master join
    pm.units AS product_type,       -- ← Product Type from product_master join
    (COALESCE((po.current_stock)::integer, 0) - ((item.value ->> 'quantity')::integer)) AS current_stock  -- ← Current Stock calculation
  FROM pos_orders po
  CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value)
  LEFT JOIN product_master pm ON (pm.id = ((item.value ->> 'service_id')::uuid))
  WHERE po.type = 'sale' AND (item.value ->> 'type') = 'product'
)
-- ... rest of view
```

## Key Data Mapping Points

### HSN Code Flow
1. **Excel**: `row['hsn code']` → 
2. **ServiceData**: `hsnCode` → 
3. **Database**: `services[].hsn_code` → 
4. **Sales History**: `pm.hsn_code` (from product_master join)

### Product Type Flow
1. **Excel**: `row['Typre']` → 
2. **ServiceData**: `productType` → 
3. **Database**: `services[].units` → 
4. **Sales History**: `pm.units AS product_type` (from product_master join)

### Current Stock Flow
1. **Excel**: `row['current stock']` → 
2. **ServiceData**: `currentStock` → 
3. **Database**: `services[].current_stock` + `po.current_stock` → 
4. **Sales History**: `(COALESCE(po.current_stock, 0) - quantity) AS current_stock`

## Database Views That Use This Data

### 1. sales_history_fin
- **HSN Code**: `pm.hsn_code`
- **Product Type**: `pm.units AS product_type`
- **Current Stock**: `(COALESCE(po.current_stock, 0) - quantity) AS current_stock`

### 2. sales_history_final
- **HSN Code**: `pm.hsn_code`
- **Product Type**: `pm.units AS product_type`
- **Current Stock**: `COALESCE(po.current_stock, 0) AS stock_before_sale`

### 3. sales_history_final_test3
- **HSN Code**: `pm.hsn_code`
- **Product Type**: `pm.units AS product_type`
- **Current Stock**: `(COALESCE(po.current_stock, 0) - quantity) AS current_stock_after_sale`

## Important Notes

### 1. Product Master Join
The sales history views join with `product_master` table to get HSN codes and product types:
```sql
LEFT JOIN product_master pm ON (pm.id = ((item.value ->> 'service_id')::uuid))
```

### 2. Current Stock Calculation
Current stock is calculated differently in different views:
- **Before sale**: `po.current_stock`
- **After sale**: `po.current_stock - quantity`

### 3. Data Preservation
The import function preserves all original Excel data in the `stock_snapshot` field:
```typescript
stock_snapshot: {
  import_type: 'historical_excel_import',
  import_date: new Date().toISOString(),
  original_invoice: order.invoiceNo,
  note: 'Historical data - no stock operations',
  stock_info: stockInfo.length > 0 ? stockInfo : undefined
}
```

### 4. Fallback Values
- **HSN Code**: Falls back to "33059040" for products if not provided
- **Product Type**: Falls back to "pcs" if not provided
- **Current Stock**: Falls back to null if not provided

## Verification Queries

To verify the data flow, you can run these queries:

```sql
-- Check imported orders with stock data
SELECT 
  po.id,
  po.invoice_no,
  po.current_stock,
  po.stock_snapshot,
  jsonb_array_elements(po.services) as service
FROM pos_orders po
WHERE po.source = 'historical_import'
LIMIT 5;

-- Check sales history view data
SELECT 
  order_id,
  product_name,
  hsn_code,
  product_type,
  current_stock
FROM sales_history_fin
WHERE order_id IN (
  SELECT id FROM pos_orders 
  WHERE source = 'historical_import' 
  LIMIT 5
);
```

## Summary

The `AggregatedExcelImporter.tsx` component ensures that:
1. **HSN codes** from Excel are preserved in the `services[].hsn_code` field
2. **Product types** from Excel are preserved in the `services[].units` field  
3. **Current stock** from Excel is preserved in both `services[].current_stock` and `po.current_stock` fields
4. All data flows correctly into the sales history views for reporting and analytics
5. Original Excel data is preserved in the `stock_snapshot` field for audit purposes 