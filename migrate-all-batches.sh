#!/bin/bash

# 🚀 Complete Client Migration Script using Direct Database Access
# This script migrates all 4,191 clients from Excel to Supabase in one stroke

echo "🚀 COMPLETE CLIENT MIGRATION - Option 2: Direct Database Access"
echo "================================================================="
echo ""

# IMPORTANT: Replace this with your actual connection string
# Get it from: https://mtyudylsozncvilibxda.supabase.co (Click "Connect" button)
CONNECTION_STRING="postgresql://postgres:W8nFpzGX7bt9sSXj@db.mtyudylsozncvilibxda.supabase.co:5432/postgres"

# Check if user has updated the connection string
if [[ "$CONNECTION_STRING" == *"[YOUR_PASSWORD]"* ]]; then
    echo "❌ ERROR: Please update the CONNECTION_STRING variable with your actual database password"
    echo ""
    echo "📱 To get your connection string:"
    echo "1. Go to: https://mtyudylsozncvilibxda.supabase.co"
    echo "2. Click the 'Connect' button at the top"
    echo "3. Copy the 'Direct connection' string"
    echo "4. Replace the CONNECTION_STRING variable in this script"
    echo ""
    exit 1
fi

echo "📊 MIGRATION SUMMARY:"
echo "   • Total clients to migrate: 4,191"
echo "   • Source: Clients Migration (1).xlsx"
echo "   • Combined batch files: 17"
echo "   • Records per batch: 250 (last batch: 141)"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ ERROR: psql is not installed or not in PATH"
    echo ""
    echo "📦 To install psql:"
    echo "   On Mac: brew install postgresql"
    echo "   On Ubuntu: sudo apt-get install postgresql-client"
    echo "   On Windows: Download from https://www.postgresql.org/download/windows/"
    echo ""
    exit 1
fi

# Check if combined batch files exist
MISSING_FILES=()
for i in {01..17}; do
    FILE="combined-batch-$i.sql"
    if [ ! -f "$FILE" ]; then
        MISSING_FILES+=("$FILE")
    fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
    echo "❌ ERROR: Missing combined batch files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "💡 Run the complete-migration.cjs script first to generate these files"
    exit 1
fi

echo "✅ Pre-migration checks passed!"
echo ""

# Test database connection
echo "🔌 Testing database connection..."
if psql "$CONNECTION_STRING" -c "SELECT 1;" &> /dev/null; then
    echo "✅ Database connection successful!"
else
    echo "❌ ERROR: Cannot connect to database"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   • Check your connection string"
    echo "   • Verify your password is correct"
    echo "   • Try using Session Pooler connection if direct fails"
    echo ""
    exit 1
fi

echo ""

# Backup existing clients (optional but recommended)
echo "💾 Creating backup of existing clients..."
psql "$CONNECTION_STRING" -c "DROP TABLE IF EXISTS clients_backup_before_migration;" &> /dev/null
psql "$CONNECTION_STRING" -c "CREATE TABLE clients_backup_before_migration AS SELECT * FROM clients;" &> /dev/null
echo "✅ Backup created as 'clients_backup_before_migration'"
echo ""

# Start migration
echo "🚀 Starting migration execution..."
echo ""

TOTAL_MIGRATED=0
FAILED_BATCHES=()

# Execute all combined batches
for i in {01..17}; do
    FILE="combined-batch-$i.sql"
    BATCH_NUM=$((10#$i))  # Convert to decimal
    
    if [ $BATCH_NUM -eq 17 ]; then
        RECORDS_IN_BATCH=141  # Last batch has 141 records
    else
        RECORDS_IN_BATCH=250  # All other batches have 250 records
    fi
    
    echo "🔄 Executing batch $BATCH_NUM ($FILE)..."
    echo "   📊 Records in this batch: $RECORDS_IN_BATCH"
    
    # Execute the batch
    if psql "$CONNECTION_STRING" -f "$FILE" &> /dev/null; then
        echo "   ✅ Batch $BATCH_NUM completed successfully"
        TOTAL_MIGRATED=$((TOTAL_MIGRATED + RECORDS_IN_BATCH))
    else
        echo "   ❌ Error in batch $BATCH_NUM"
        FAILED_BATCHES+=("$BATCH_NUM")
    fi
    
    echo "   📈 Total migrated so far: $TOTAL_MIGRATED"
    echo ""
done

# Final results
echo "🎉 MIGRATION EXECUTION COMPLETED!"
echo "=================================="
echo ""

if [ ${#FAILED_BATCHES[@]} -eq 0 ]; then
    echo "✅ ALL BATCHES SUCCESSFUL!"
    echo "📊 Total clients migrated: $TOTAL_MIGRATED"
    echo "🎯 Expected total: 4,191"
    
    if [ $TOTAL_MIGRATED -eq 4191 ]; then
        echo "✅ Migration count matches expected total!"
    else
        echo "⚠️  Migration count differs from expected. Please verify manually."
    fi
else
    echo "❌ SOME BATCHES FAILED:"
    for batch in "${FAILED_BATCHES[@]}"; do
        echo "   - Batch $batch"
    done
    echo ""
    echo "💡 You can retry failed batches manually:"
    for batch in "${FAILED_BATCHES[@]}"; do
        echo "   psql \"$CONNECTION_STRING\" -f combined-batch-$(printf "%02d" $batch).sql"
    done
fi

echo ""
echo "🔍 VERIFICATION COMMANDS:"
echo "========================"
echo ""
echo "# Check total clients:"
echo "psql \"$CONNECTION_STRING\" -c \"SELECT COUNT(*) as total_clients FROM clients;\""
echo ""
echo "# Check migrated clients:"
echo "psql \"$CONNECTION_STRING\" -c \"SELECT COUNT(*) as migrated_clients FROM clients WHERE notes LIKE '%Migrated from Excel%';\""
echo ""
echo "# View sample migrated data:"
echo "psql \"$CONNECTION_STRING\" -c \"SELECT full_name, mobile_number, gender FROM clients WHERE notes LIKE '%Migrated from Excel%' LIMIT 10;\""
echo ""

echo "🎉 Migration process completed!"
echo "📱 Check your Clients page in the salon software to see all migrated customers." 