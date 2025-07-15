# Complete Import Instructions for April 2025 Services Data

## Overview
This guide provides instructions for importing April 2025 services data with proper invoice merging. The system will:
- **Merge services by invoice number and client name** into single bills
- **Format payment methods with amounts in brackets** (e.g., "gpay (₹1400), card (₹2500)")
- **Create all necessary reference data** (clients, stylists, services)
- **Maintain multi-tenant isolation** with user ID filtering

## Key Features

### 1. Invoice Merging
- Same client name + same invoice number = **Single consolidated bill**
- Example: Invoice #23 for "Niddhi Patel" has 4 services → Creates 1 POS order with 4 services

### 2. Payment Method Formatting
- **Single payment method**: "gpay (₹1400)"
- **Multiple payment methods**: "cash (₹800), card (₹1600)"
- Amounts are calculated per payment method automatically

### 3. Service Details
Each service includes:
- Service name, price, quantity
- Discount amount and tax percentage
- Assigned stylist
- Calculated totals (subtotal, tax, final amount)

### 4. Reference Data Creation
Automatically creates missing:
- **Clients** (with phone numbers)
- **Stylists** (marked as available)
- **Services** (with prices and 60-min duration)

## Files Generated

### 1. `import_april_services_complete.sql`
- **Complete import script** with all 790+ service records
- **Proper invoice merging** logic
- **Payment method formatting** with amounts
- **Reference data creation**
- **Multi-tenant isolation** (user_id filtering)

### 2. `import_april_services_merged_final.sql`
- **Subset of data** for testing (first 100 records)
- Same merging logic as complete version
- Good for initial testing

## Import Process

### Step 1: Prepare Database
1. Open **Supabase SQL Editor**
2. Ensure you're connected to project: `mtyudylsozncvilibxda`
3. Verify user ID: `3f4b718f-70cb-4873-a62c-b8806a92e25b`

### Step 2: Execute Import Script
1. Copy contents of `import_april_services_complete.sql`
2. Paste into Supabase SQL Editor
3. **Execute the entire script at once**
4. Wait for completion (may take 30-60 seconds)

### Step 3: Verify Import
The script will show:
- **Import Summary**: Total orders, revenue, unique clients, stylists
- **Sample Records**: First 10 merged invoices
- **Multi-Service Examples**: Invoices with multiple services

## Expected Results

### Sample Merged Invoice Output
```
Invoice #2 - Tarun Vatiani (9904079784)
- Services: Hair Cut With Senior Hairdresser (Male), Beard Trim
- Stylist: Vandan Gohil
- Payment: gpay (₹1400)
- Total: ₹1652 (including tax)
```

### Sample Multi-Payment Invoice
```
Invoice #97 - Urjaa Patel (9504790000)
- Services: 14 different services
- Stylists: Multiple stylists involved
- Payment: card (₹12840)
- Total: ₹15151.2 (including tax)
```

## Data Structure

### POS Orders Table Fields
- `client_name`: Customer name
- `customer_name`: Same as client_name
- `stylist_name`: Primary stylist (first alphabetically)
- `services`: JSON array of all services
- `payments`: JSON array of payment methods with amounts
- `payment_method`: Formatted string with amounts in brackets
- `total_amount`: Final amount including tax
- `notes`: Import metadata with invoice number and service count

### Services JSON Structure
```json
{
  "name": "Hair Cut With Senior Hairdresser (Male)",
  "price": 1000,
  "quantity": 1,
  "discount": 0,
  "tax_percent": 18,
  "stylist": "Vandan Gohil",
  "subtotal": 1000,
  "total": 1000,
  "tax_amount": 180
}
```

## Troubleshooting

### Authentication Issues
If you get "Authentication required" errors:
1. The script includes `SET row_security = off;` to bypass RLS
2. Make sure you're running as an authenticated user
3. Re-enable RLS at the end with `SET row_security = on;`

### Duplicate Data
- The script uses `NOT EXISTS` clauses to prevent duplicates
- Safe to run multiple times
- Will only insert new records

### Performance
- Script processes 790+ records in batches
- Uses CTEs for efficient grouping
- Temporary tables for better performance

## Verification Queries

### Check Import Success
```sql
SELECT 
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    COUNT(DISTINCT client_name) as unique_clients
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid;
```

### View Multi-Service Invoices
```sql
SELECT 
    client_name,
    payment_method,
    total_amount,
    jsonb_array_length(services) as service_count,
    notes
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
AND jsonb_array_length(services) > 1
ORDER BY jsonb_array_length(services) DESC;
```

### Check Payment Method Formatting
```sql
SELECT 
    client_name,
    payment_method,
    total_amount
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
AND payment_method LIKE '%(%'
ORDER BY created_at
LIMIT 10;
```

## Success Metrics

After successful import, you should see:
- **~100+ POS orders** (merged from 790 service records)
- **Unique clients** with proper phone numbers
- **All stylists** created and available
- **All services** with correct pricing
- **Payment methods** formatted with amounts in brackets
- **Multi-tenant isolation** working correctly

## Support

If you encounter issues:
1. Check the verification queries above
2. Review the import summary output
3. Ensure proper user authentication
4. Verify the user_id matches your profile

The import script is designed to be **idempotent** and **safe to re-run** if needed. 