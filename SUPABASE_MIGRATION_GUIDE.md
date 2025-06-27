# Supabase Migration Guide

## Issue
The REST API is not working because some required tables don't exist in the database. We need to run the migrations to create these tables, but they contain PL/pgSQL functions and triggers that can't be executed through the REST API.

## Solution
We need to use the Supabase CLI to run the migrations properly.

### 1. Install Supabase CLI
```bash
npm install supabase --save-dev
```

### 2. Initialize Supabase Project
```bash
npx supabase init
```

### 3. Start Local Development Stack
```bash
npx supabase start
```

### 4. Link Your Project
```bash
npx supabase link --project-ref mtyudylsozncvilibxda
```
You'll be prompted to enter your access token. You can get this from your Supabase dashboard:
1. Go to https://app.supabase.com
2. Click on your profile icon
3. Click "Access Tokens"
4. Generate a new token or copy an existing one

### 5. Push the Migrations
```bash
npx supabase db push
```

### 6. Verify Tables
After pushing the migrations, verify that all required tables exist:
- inventory_purchases
- inventory_sales
- inventory_balance_stock
- sales_products
- inventory_salon_consumption

### 7. Test REST API
Once the migrations are complete, test the REST API endpoints to ensure they're working correctly.

## Troubleshooting
If you encounter any issues:

1. Check the migration logs for errors
2. Verify your database connection
3. Ensure all required tables are created
4. Check the RLS (Row Level Security) policies
5. Verify your API keys and authentication

## Important Notes
- Make sure to backup your data before running migrations
- Some migrations may take time to complete
- Keep your Supabase CLI updated
- Monitor the migration process for any errors

## Required Tables and Their Dependencies

1. Base Tables:
   - `products`
   - `inventory_products`

2. Sales and Inventory Tables:
   - `sales_product_new`
   - `inventory_salon_consumption`
   - `salon_consumption_products`

3. Views and Functions:
   - `salon_consumption_products_view`
   - `increment_product_stock`
   - `decrement_product_stock`

4. Additional Features:
   - `purchase_history_with_stock`
   - `product_price_history`

## Migration Order
The migrations must be run in the correct order due to dependencies. The order is:

1. Base tables first
2. Sales and inventory tables
3. Views and functions
4. Additional features
5. Membership and appointments
6. Price history

The Supabase CLI will handle this order automatically based on the migration file timestamps. 