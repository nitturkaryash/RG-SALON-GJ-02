#!/bin/bash
# Complete Database Dump Script
# Project: mtyudylsozncvilibxda

echo "========================================="
echo "COMPLETE DATABASE DUMP GENERATOR"
echo "========================================="
echo ""

# Database connection details
DB_HOST="db.mtyudylsozncvilibxda.supabase.co"
DB_NAME="postgres"
DB_USER="postgres"

echo "This script will generate comprehensive database dumps including:"
echo "  ✓ All table schemas"
echo "  ✓ All table data"
echo "  ✓ All indexes"
echo "  ✓ All triggers"
echo "  ✓ All functions/procedures"
echo "  ✓ All views"
echo "  ✓ All sequences"
echo "  ✓ All constraints"
echo "  ✓ RLS policies"
echo ""
echo "========================================="
echo ""

# 1. Complete dump (schema + data)
echo "1. Creating complete dump (schema + data)..."
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --verbose \
  --format=plain \
  --no-owner \
  --no-privileges \
  > database_complete_dump.sql

# 2. Schema only dump
echo "2. Creating schema-only dump..."
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --schema-only \
  --verbose \
  --format=plain \
  --no-owner \
  --no-privileges \
  > database_schema_only.sql

# 3. Data only dump
echo "3. Creating data-only dump..."
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --data-only \
  --verbose \
  --format=plain \
  --no-owner \
  --no-privileges \
  > database_data_only.sql

# 4. Custom format dump (compressed, includes everything)
echo "4. Creating custom format dump (compressed)..."
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --verbose \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  > database_complete_dump.backup

# 5. Directory format dump (allows parallel restore)
echo "5. Creating directory format dump..."
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --verbose \
  --format=directory \
  --jobs=4 \
  --no-owner \
  --no-privileges \
  --file=database_directory_dump

echo ""
echo "========================================="
echo "DUMP GENERATION COMPLETE!"
echo "========================================="
echo ""
echo "Generated files:"
echo "  1. database_complete_dump.sql      - Complete SQL dump (schema + data)"
echo "  2. database_schema_only.sql        - Schema only (tables, triggers, functions, indexes)"
echo "  3. database_data_only.sql          - Data only (INSERT statements)"
echo "  4. database_complete_dump.backup   - Compressed custom format"
echo "  5. database_directory_dump/        - Directory format for parallel restore"
echo ""
echo "To restore:"
echo "  From SQL:    psql -h HOST -U USER -d DB < database_complete_dump.sql"
echo "  From backup: pg_restore -h HOST -U USER -d DB database_complete_dump.backup"
echo "  From dir:    pg_restore -h HOST -U USER -d DB -j 4 database_directory_dump"
echo ""


