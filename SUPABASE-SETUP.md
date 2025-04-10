# Supabase Database Setup Instructions

## Overview
This document provides instructions for setting up the required database tables in your Supabase project. The application is encountering errors because some required tables don't exist or have incorrect schemas in your Supabase database.

## Error Summary
The application is encountering 404 and 400 errors when trying to access the following Supabase resources:
- `pos_orders` table (404 error - table doesn't exist)
- `services` table (400 error - possible permission or schema issue)
- `inventory_balance_stock` view (400 error - possible permission or schema issue)
- `clients` table (400 error - possible permission or schema issue)

## Quick Setup (Recommended)

Run the all-in-one setup script to check, create, and seed your database:

```bash
node setup-supabase.js
```

This script will:
1. Check if the required tables exist
2. Try to create any missing tables
3. Save SQL statements to a file for manual execution if needed
4. Seed the database with sample data if tables are created successfully

## Required Manual Actions

Based on testing, you need to perform the following actions in the Supabase SQL Editor:

1. **Create Missing Tables**
   - Execute the SQL in `supabase-setup.sql` to create:
     - `pos_orders` table
     - `pos_order_items` table

2. **Update Clients Table**
   - Execute the SQL in `clientUpdate.sql` to add:
     - `last_visit` column
     - Other missing columns if needed

## Manual Setup Options

### Option 1: Using the Supabase SQL Editor

1. **Login to Supabase Dashboard**
   - Go to [https://app.supabase.io](https://app.supabase.io)
   - Navigate to your project (`cpkxkoosykyahuezxela`)

2. **Open SQL Editor**
   - Click on the "SQL Editor" option in the left sidebar

3. **Create Required Tables**
   - Copy and run each of the following SQL blocks separately:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

```sql
-- Create POS Orders table
CREATE TABLE IF NOT EXISTS pos_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  client_name TEXT,
  consumption_purpose TEXT,
  consumption_notes TEXT,
  total NUMERIC NOT NULL DEFAULT 0,
  type TEXT DEFAULT 'sale',
  is_salon_consumption BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'completed',
  payment_method TEXT DEFAULT 'cash'
);
```

```sql
-- Create POS Order Items table
CREATE TABLE IF NOT EXISTS pos_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID,
  service_name TEXT NOT NULL,
  service_type TEXT DEFAULT 'service',
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  gst_percentage NUMERIC DEFAULT 18,
  hsn_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  pos_order_id UUID REFERENCES pos_orders(id)
);
```

```sql
-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  total_spent NUMERIC DEFAULT 0,
  pending_payment NUMERIC DEFAULT 0,
  last_visit TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

```sql
-- Create a sample inventory_balance_stock view 
CREATE OR REPLACE VIEW inventory_balance_stock AS
SELECT
  product_name,
  balance_qty,
  mrp_incl_gst
FROM (
  SELECT
    'Sample Product' as product_name,
    100 as balance_qty,
    500 as mrp_incl_gst
) as sample_data;
```

4. **Verify Tables**
   - After creating the tables, verify they exist by running:

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Option 2: Using Individual Setup Scripts

If you prefer to run the setup process step by step:

1. **Check Database Tables**
   ```
   node setupDatabase.js
   ```

2. **Check POS Orders Table**
   ```
   node setupPosOrders.js
   ```

3. **Seed Sample Data**
   ```
   node seedSampleData.js
   ```

## Adding Sample Data

After creating the tables, you can seed them with sample data to ensure everything is working correctly:

```bash
node seedSampleData.js
```

## Additional Tables

If your application requires additional tables for inventory management, you may need to create them as well. The most important tables for this initial setup are the ones listed above, which should resolve the current errors.

## Troubleshooting

- **Permission Issues**: Make sure your Supabase API key has the correct permissions to create and access tables
- **Schema Conflicts**: If you encounter errors about existing tables with different schemas, you may need to drop and recreate them
- **RPC Function Not Available**: If you see errors about the `exec_sql` RPC function, you'll need to use the Supabase SQL Editor method
- **UUID Dependency**: Make sure your package.json includes the UUID dependency (`uuid`) for the seeding script
- **Column Missing Errors**: If you see errors about missing columns, execute the appropriate SQL from `clientUpdate.sql`

## After Setup

After completing all the steps:

1. Run the setup script again to verify and seed the database:
   ```bash
   node setup-supabase.js
   ```

2. Restart your application and check if the errors are resolved.

3. If you encounter any other issues, check the console logs for more specific error messages.

## Visual Setup Guide

For a more visual guide with copy buttons for the SQL statements, open the included HTML file:
```
open supabase-setup.html
```

This HTML file provides a user-friendly interface for copying the SQL statements to create the tables. 