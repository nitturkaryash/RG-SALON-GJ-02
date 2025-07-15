# Excel Aggregation Import Guide

## Overview

The new **Aggregated Excel Importer** automatically combines multiple service entries with the same **Invoice Number** into a single order. This solves the problem of having duplicate orders for clients who received multiple services on the same visit.

## Features

### ✅ **Automatic Aggregation**
- Groups rows by `Invoice No` column
- Combines multiple services into single orders
- Calculates totals automatically
- Maintains all service details

### ✅ **Smart Column Detection**
- Automatically detects column variations:
  - `Invoice No`, `Invoice Number`, `invoice_no`, `INVOICE NO`
  - `Guest Name`, `Client Name`, `client_name`
  - `Service`, `PRODUCT NAME`, `service_name`
  - And many more...

### ✅ **Comprehensive Analysis**
- Shows file structure before import
- Identifies duplicate invoices that will be aggregated
- Validates Excel structure
- Provides detailed preview

## Excel File Requirements

Your Excel file should have these columns (case-insensitive):

### **Required Columns:**
| Column | Alternative Names | Description |
|--------|------------------|-------------|
| `Invoice No` | `Invoice Number`, `invoice_no` | Unique identifier for grouping |
| `Guest Name` | `Client Name`, `client_name` | Customer name |
| `Date` | `date` | Service date |
| `Service` | `PRODUCT NAME`, `service_name` | Service/product name |
| `Unit Price` | `Price`, `unit_price` | Price per service |

### **Optional Columns:**
| Column | Alternative Names | Description |
|--------|------------------|-------------|
| `Staff` | `stylist`, `Stylist` | Service provider |
| `Category` | `category` | Service category |
| `Qty` | `quantity` | Service quantity (default: 1) |
| `Discount` | `discount` | Discount amount |
| `Tax %` | `Tax`, `tax_percent` | Tax percentage (default: 18%) |
| `Payment Mode` | `payment_method` | Payment method (default: cash) |
| `Guest Number` | `Phone`, `phone` | Customer phone |

## Example Excel Structure

```
| Invoice No | Guest Name | Date       | Service    | Staff      | Unit Price | Qty | Tax % |
|------------|------------|------------|------------|------------|------------|-----|-------|
| INV001     | John Doe   | 2025-01-01 | Hair Cut   | Stylist A  | 500        | 1   | 18    |
| INV001     | John Doe   | 2025-01-01 | Beard Trim | Stylist A  | 200        | 1   | 18    |
| INV002     | Jane Smith | 2025-01-01 | Hair Color | Stylist B  | 1500       | 1   | 18    |
```

**Result:** 
- INV001: Single order with 2 services (Hair Cut + Beard Trim) = ₹826
- INV002: Single order with 1 service (Hair Color) = ₹1770

## How to Use

### 1. **Access the Feature**
- Go to the **Orders** page
- Look for the **"Import Aggregated Orders"** button
- Click to open the import dialog

### 2. **Upload & Analyze**
- Select your Excel file (.xlsx or .xls)
- Click **"Analyze File"**
- Review the analysis summary:
  - Total rows found
  - Unique invoices identified
  - Duplicate invoices that will be aggregated
  - Any structure warnings

### 3. **Preview & Import**
- Review the aggregated orders preview
- Check that services are grouped correctly
- Click **"Import X Orders"** to save to database

### 4. **Verification**
- Check the Orders page to verify imports
- Each invoice should appear as a single order
- All services should be listed within each order

## Troubleshooting

### **Column Name Issues**
If you see warnings about missing columns:
1. Check the console for column suggestions
2. Rename your Excel columns to match expected names
3. Or use the alternative column names listed above

### **Date Format Issues**
- Use Excel date format (not text)
- Acceptable formats: `2025-01-01`, `01-Jan-2025`, Excel serial dates

### **Invoice Number Issues**
- Ensure Invoice No column exists and has values
- Empty invoice numbers will get auto-generated as `AUTO-1`, `AUTO-2`, etc.

### **Calculation Issues**
- Verify Unit Price is numeric
- Check Tax % is numeric (default 18% if missing)
- Ensure Qty is numeric (default 1 if missing)

## Testing

### **Test Script Available**
Run the test script to understand the aggregation logic:

```bash
node test_excel_aggregation.js
```

This will:
- Show sample Excel data
- Demonstrate aggregation logic
- Create a sample Excel file for testing
- Show before/after comparison

### **Sample Excel File**
The test script creates `sample_services_for_aggregation.xlsx` with sample data showing:
- Multiple services with same invoice number
- Different clients with different invoice numbers
- Various service types and prices

## Database Schema

The aggregated orders are stored in the `pos_orders` table with this structure:

```sql
{
  id: uuid,
  invoice_no: string,
  client_name: string,
  client_phone: string,
  services: [
    {
      name: string,
      category: string,
      stylist: string,
      quantity: number,
      unitPrice: number,
      totalAmount: number
    }
  ],
  payments: [
    {
      method: string,
      amount: number
    }
  ],
  subtotal: number,
  discount: number,
  tax: number,
  total: number,
  status: 'completed',
  created_at: timestamp
}
```

## Benefits

### **Before Aggregation:**
- 10 Excel rows = 10 separate orders
- Duplicate clients with same invoice date
- Difficult to track complete service sessions
- Inflated order counts

### **After Aggregation:**
- 10 Excel rows = 3-5 combined orders (based on invoice numbers)
- One order per client visit
- Complete service history per order
- Accurate order metrics

## Support

If you encounter issues:

1. **Check Console Logs** - Detailed analysis is logged to browser console
2. **Review Excel Structure** - Ensure required columns are present
3. **Test with Sample File** - Use the generated sample file first
4. **Check Import Preview** - Verify aggregation looks correct before importing

---

**Pro Tip:** Use consistent invoice numbering in your Excel file. For example: `INV001`, `INV002`, etc. This makes tracking and aggregation much cleaner! 