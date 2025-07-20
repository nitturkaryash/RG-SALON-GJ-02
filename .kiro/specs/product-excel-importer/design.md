# Design Document

## Overview

This design enhances the existing AggregatedExcelImporter component to handle product data imports from Excel files. The solution extends the current service-focused importer to support product inventory management, including automatic product_master table updates, stock management, and comprehensive data validation.

The design maintains backward compatibility with existing service imports while adding robust product handling capabilities that integrate seamlessly with the salon's inventory management system.

## Architecture

### High-Level Flow
1. **File Selection & Type Detection** - User selects Excel file, system detects content type
2. **Import Type Selection** - User chooses between Services, Products, Orders (Mixed), or Memberships
3. **Data Analysis & Validation** - System validates Excel structure and maps columns
4. **Preview Generation** - Display mapped data with validation results
5. **Product Master Sync** - Check/update product_master table before import
6. **Database Import** - Insert/update records with comprehensive error handling
7. **Results Summary** - Show success/failure counts with detailed logging

### Component Architecture
```
AggregatedExcelImporter
├── Product Detection Logic
├── Excel Analysis Engine
├── Data Mapping & Validation
├── Product Master Management
├── Import Processing Engine
└── UI Components (Preview, Progress, Results)
```

## Components and Interfaces

### Enhanced Interfaces

```typescript
interface ProductData {
  name: string;
  category: string;
  hsn_code: string;
  quantity: number;
  unitPrice: number;
  mrp_incl_gst?: number;
  mrp_excl_gst?: number;
  gst_percentage: number;
  units?: string;
  discount?: number;
  supplier?: string;
  type: 'product';
  raw_data: any;
}

interface ProductImportSummary extends ExcelImportSummary {
  productStats: {
    newProducts: number;
    updatedProducts: number;
    totalStockAdded: number;
    duplicatesFound: number;
  };
  productMasterUpdates: ProductMasterUpdate[];
}

interface ProductMasterUpdate {
  productName: string;
  action: 'created' | 'updated';
  oldStock?: number;
  newStock: number;
  productId: string;
}
```

### Core Functions

#### 1. Product Detection & Validation
```typescript
const detectProductData = (json: any[]): boolean => {
  // Check for product-specific columns
  const productColumns = ['PRODUCT NAME', 'HSN CODE', 'Category', 'Qty', 'Unit Price'];
  const hasProductColumns = productColumns.some(col => 
    json[0] && Object.keys(json[0]).some(key => 
      key.toLowerCase().includes(col.toLowerCase())
    )
  );
  return hasProductColumns;
};

const validateProductStructure = (analysis: ExcelAnalysis): ValidationResult => {
  const requiredColumns = ['PRODUCT NAME', 'HSN CODE', 'Category', 'Qty', 'Unit Price'];
  const missingColumns = requiredColumns.filter(col => 
    !analysis.columns.some(c => c.toLowerCase().includes(col.toLowerCase()))
  );
  
  return {
    isValid: missingColumns.length === 0,
    missingColumns,
    suggestions: generateProductSuggestions(missingColumns, analysis.columns)
  };
};
```

#### 2. Product Data Mapping
```typescript
const mapExcelToProductData = (row: any): ProductData => {
  return {
    name: row['PRODUCT NAME'] || row['Product Name'] || row['product_name'] || '',
    category: row['Category'] || row['category'] || 'General',
    hsn_code: row['HSN CODE'] || row['HSN Code'] || row['hsn_code'] || '',
    quantity: parseInt(row['Qty'] || row['Quantity'] || row['quantity'] || '0') || 0,
    unitPrice: parseFloat(row['Unit Price'] || row['Price'] || row['unit_price'] || '0') || 0,
    mrp_incl_gst: parseFloat(row['MRP Incl GST'] || row['mrp_incl_gst'] || '0') || undefined,
    mrp_excl_gst: parseFloat(row['MRP Excl GST'] || row['mrp_excl_gst'] || '0') || undefined,
    gst_percentage: parseFloat(row['GST %'] || row['GST Percentage'] || row['gst_percentage'] || '18') || 18,
    units: row['Units'] || row['units'] || 'pcs',
    discount: parseFloat(row['Discount'] || row['discount'] || '0') || 0,
    supplier: row['Supplier'] || row['supplier'] || '',
    type: 'product',
    raw_data: { ...row }
  };
};
```

#### 3. Product Master Management
```typescript
const syncProductMaster = async (products: ProductData[], userId: string): Promise<ProductMasterUpdate[]> => {
  const updates: ProductMasterUpdate[] = [];
  
  for (const product of products) {
    // Check if product exists
    const { data: existing } = await supabase
      .from('product_master')
      .select('id, stock_quantity')
      .ilike('name', product.name)
      .ilike('category', product.category)
      .ilike('hsn_code', product.hsn_code)
      .maybeSingle();
    
    if (!existing) {
      // Create new product
      const { data: newProduct } = await supabase
        .from('product_master')
        .insert({
          name: product.name,
          description: `Imported from Excel: ${new Date().toISOString()}`,
          price: product.unitPrice,
          stock_quantity: product.quantity,
          hsn_code: product.hsn_code,
          category: product.category,
          gst_percentage: product.gst_percentage,
          units: product.units,
          mrp_incl_gst: product.mrp_incl_gst,
          mrp_excl_gst: product.mrp_excl_gst,
          active: true,
          user_id: userId,
          raw_data: product.raw_data
        })
        .select('id')
        .single();
      
      updates.push({
        productName: product.name,
        action: 'created',
        newStock: product.quantity,
        productId: newProduct.id
      });
    } else {
      // Update existing product stock
      const newStock = (existing.stock_quantity || 0) + product.quantity;
      await supabase
        .from('product_master')
        .update({
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      
      updates.push({
        productName: product.name,
        action: 'updated',
        oldStock: existing.stock_quantity,
        newStock: newStock,
        productId: existing.id
      });
    }
  }
  
  return updates;
};
```

## Data Models

### Product Master Table Structure
Based on the existing schema, the product_master table includes:
- `id` (uuid, primary key)
- `name` (text, required)
- `description` (text)
- `price` (numeric)
- `cost_price` (numeric)
- `stock_quantity` (integer, default 0)
- `hsn_code` (text)
- `category` (text)
- `gst_percentage` (integer, default 18)
- `units` (text)
- `mrp_incl_gst` (numeric)
- `mrp_excl_gst` (numeric)
- `active` (boolean, default true)
- `user_id` (uuid, foreign key)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `raw_data` (jsonb, for preserving Excel data)

### Excel Column Mapping
| Excel Column | Database Field | Validation |
|--------------|----------------|------------|
| PRODUCT NAME | name | Required, non-empty |
| HSN CODE | hsn_code | Required for GST compliance |
| Category | category | Default to 'General' |
| Qty | stock_quantity | Integer, >= 0 |
| Unit Price | price | Numeric, >= 0 |
| MRP Incl GST | mrp_incl_gst | Numeric, optional |
| MRP Excl GST | mrp_excl_gst | Numeric, optional |
| GST % | gst_percentage | Numeric, default 18 |
| Units | units | Text, default 'pcs' |
| Supplier | supplier | Text, optional |

## Error Handling

### Validation Errors
1. **Missing Required Columns** - Show clear error with suggestions
2. **Invalid Data Types** - Highlight rows with type conversion issues
3. **Duplicate Products** - Warn about potential duplicates with different HSN codes
4. **Stock Calculation Errors** - Handle negative stock scenarios gracefully

### Import Errors
1. **Database Connection Issues** - Retry mechanism with exponential backoff
2. **Constraint Violations** - Skip invalid records, continue with valid ones
3. **Permission Errors** - Clear error messages about user access rights
4. **Transaction Failures** - Rollback partial imports, maintain data integrity

### Error Recovery
```typescript
const handleImportError = (error: any, productName: string, rowIndex: number) => {
  const errorInfo = {
    product: productName,
    row: rowIndex,
    error: error.message,
    timestamp: new Date().toISOString()
  };
  
  console.error('Product import error:', errorInfo);
  
  // Add to error collection for user feedback
  importErrors.push(`Row ${rowIndex}: ${productName} - ${error.message}`);
  
  // Continue with next product
  return false; // Don't stop import process
};
```

## Testing Strategy

### Unit Tests
1. **Data Mapping Functions** - Test Excel column mapping to database fields
2. **Validation Logic** - Test required field validation and data type conversion
3. **Product Detection** - Test automatic detection of product vs service data
4. **Error Handling** - Test graceful handling of various error scenarios

### Integration Tests
1. **Database Operations** - Test product_master CRUD operations
2. **Excel Processing** - Test with real Excel files from different formats
3. **Stock Management** - Test stock addition and update scenarios
4. **Multi-user Scenarios** - Test tenant isolation and user permissions

### End-to-End Tests
1. **Complete Import Flow** - Test full import process from file selection to completion
2. **Mixed Data Handling** - Test imports with both products and services
3. **Error Recovery** - Test partial failure scenarios and recovery
4. **Performance Testing** - Test with large Excel files (1000+ products)

### Test Data Requirements
- Sample Excel files with various product formats
- Edge cases: empty cells, invalid data types, special characters
- Large datasets for performance testing
- Multi-tenant test scenarios

## Performance Considerations

### Optimization Strategies
1. **Batch Processing** - Process products in batches of 50-100 to avoid memory issues
2. **Database Transactions** - Use transactions for atomic operations
3. **Caching** - Cache product_master lookups during import
4. **Progress Tracking** - Real-time progress updates for user feedback

### Memory Management
- Stream large Excel files instead of loading entirely into memory
- Clear processed data from memory after each batch
- Use pagination for preview displays of large datasets

### Database Optimization
- Use prepared statements for repeated queries
- Implement connection pooling for concurrent operations
- Add database indexes on frequently queried columns (name, hsn_code, category)