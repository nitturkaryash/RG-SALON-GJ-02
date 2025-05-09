#!/bin/bash

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI is not installed. Please install it first."
  exit 1
fi

echo "Running sales product view update..."

# Run the SQL script using supabase CLI
supabase db execute < update_sales_product_view.sql

echo "Update completed."
echo "Now restart your application to use the updated view and deletion functionality." 