#!/bin/bash

# Define database connection parameters
DB_NAME="postgres"
DB_USER="postgres"
DB_HOST="localhost"

# Check if PGPASSWORD is set in environment
if [ -z "$PGPASSWORD" ]; then
  echo "Please enter the password for PostgreSQL user $DB_USER:"
  read -s PGPASSWORD
  export PGPASSWORD
fi

echo "Creating sales_product_new view..."
psql -U $DB_USER -h $DB_HOST -d $DB_NAME -f create_sales_product_view.sql

# Check if the view was created successfully
if [ $? -eq 0 ]; then
  echo "sales_product_new view created successfully!"
  # Verify that the view exists
  psql -U $DB_USER -h $DB_HOST -d $DB_NAME -c "SELECT COUNT(*) FROM sales_product_new LIMIT 1;"
else
  echo "Failed to create sales_product_new view. Please check the error messages above."
fi 