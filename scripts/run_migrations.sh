#!/bin/bash

# Script to run the sales history migration
echo "Running sales history view migration to add remaining_stock..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql is not installed. Please install PostgreSQL client tools."
    exit 1
fi

# Database connection parameters - replace these with your actual values
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"postgres"}
DB_USER=${DB_USER:-"postgres"}
DB_PASSWORD=${DB_PASSWORD:-"postgres"}

# Path to migration file
MIGRATION_FILE="supabase/migrations/20250615_add_remaining_stock_to_sales_view.sql"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "Error: Migration file $MIGRATION_FILE not found."
    exit 1
fi

# Run the migration
echo "Applying migration from $MIGRATION_FILE..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f $MIGRATION_FILE

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo "Migration applied successfully!"
    echo "The sales_product_new view now includes the remaining_stock column."
    echo "Refresh your application to see the changes."
else
    echo "Error: Failed to apply migration."
    exit 1
fi

echo "Done." 