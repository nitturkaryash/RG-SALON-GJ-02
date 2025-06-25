# 🚀 Direct Database Migration Guide

## Option 2: Direct Database Access (Fastest Method)

### Prerequisites
1. Database connection tool (psql, pgAdmin, DBeaver, etc.)
2. Your Supabase connection string
3. The combined batch SQL files (ready in your project)

---

## Method A: Using psql (Command Line) - FASTEST ⚡

### Step 1: Install psql
```bash
# On Mac
brew install postgresql

# On Ubuntu/Linux
sudo apt-get install postgresql-client

# On Windows
# Download PostgreSQL from: https://www.postgresql.org/download/windows/
```

### Step 2: Get Your Connection String
1. Go to: https://mtyudylsozncvilibxda.supabase.co
2. Click **"Connect"** button
3. Copy the **Direct connection** string
4. It looks like: `postgresql://postgres:[PASSWORD]@db.mtyudylsozncvilibxda.supabase.co:5432/postgres`

### Step 3: Execute Migration Files
```bash
# Navigate to your project directory
cd /Users/yashnitturkar/Desktop/RAWDOGG/RG-SALON-GJ-02

# Execute each combined batch file
psql "your_connection_string" -f combined-batch-01.sql
psql "your_connection_string" -f combined-batch-02.sql
psql "your_connection_string" -f combined-batch-03.sql
# ... continue for all 17 files

# Or use a loop to execute all at once:
for i in {01..17}; do
  echo "Executing combined-batch-$i.sql..."
  psql "your_connection_string" -f "combined-batch-$i.sql"
  echo "✅ Batch $i completed"
done
```

---

## Method B: Using pgAdmin (GUI) - USER FRIENDLY 🖥️

### Step 1: Install pgAdmin
- Download from: https://www.pgadmin.org/
- Install and launch

### Step 2: Connect to Database
1. Right-click "Servers" → "Register" → "Server"
2. **General Tab:**
   - Name: `Supabase Salon DB`
3. **Connection Tab:**
   - Host: `db.mtyudylsozncvilibxda.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: `[YOUR_PASSWORD]`

### Step 3: Execute SQL Files
1. Right-click your database → "Query Tool"
2. Click "Open File" icon
3. Select `combined-batch-01.sql`
4. Click "Execute" (Play button)
5. Repeat for all 17 files

---

## Method C: Automated Script (RECOMMENDED) 🤖

### Create Auto-Migration Script
```bash
# Create the execution script
cat > migrate-all-batches.sh << 'EOF'
#!/bin/bash

# Replace with your actual connection string
CONNECTION_STRING="postgresql://postgres:[YOUR_PASSWORD]@db.mtyudylsozncvilibxda.supabase.co:5432/postgres"

echo "🚀 Starting complete client migration..."
echo "📊 Total batches: 17"
echo "🎯 Total clients to migrate: 4,141"
echo ""

# Execute all combined batches
for i in {01..17}; do
    FILE="combined-batch-$i.sql"
    if [ -f "$FILE" ]; then
        echo "🔄 Executing $FILE..."
        psql "$CONNECTION_STRING" -f "$FILE"
        if [ $? -eq 0 ]; then
            echo "✅ Batch $i completed successfully"
        else
            echo "❌ Error in batch $i"
            exit 1
        fi
    else
        echo "❌ File $FILE not found"
        exit 1
    fi
    echo ""
done

echo "🎉 Migration completed successfully!"
echo "📈 Total clients migrated: 4,191"
EOF

# Make it executable
chmod +x migrate-all-batches.sh

# Run the migration
./migrate-all-batches.sh
```

---

## Verification Commands

### Check Migration Progress
```sql
-- Check total clients
SELECT COUNT(*) as total_clients FROM clients;

-- Check migrated clients
SELECT COUNT(*) as migrated_clients 
FROM clients 
WHERE notes LIKE '%Migrated from Excel%';

-- View sample migrated data
SELECT full_name, mobile_number, gender 
FROM clients 
WHERE notes LIKE '%Migrated from Excel%' 
LIMIT 10;
```

---

## Troubleshooting

### Common Issues:

**1. Connection Refused**
- Check if your IP is whitelisted
- Try using Session Pooler connection string instead

**2. Authentication Failed**
- Verify password in connection string
- Reset database password in Supabase dashboard

**3. File Not Found**
- Ensure you're in the correct directory
- Check if combined batch files exist

**4. SQL Syntax Error**
- Check if the SQL files are properly formatted
- Try executing one batch file manually first

---

## Expected Results

After successful migration:
- **Before:** 52 total clients (50 migrated + 2 existing)
- **After:** 4,243 total clients (4,191 migrated + 2 existing)

All clients will have:
- ✅ Unique UUID identifiers
- ✅ Full names from Excel
- ✅ Mobile numbers properly mapped
- ✅ Gender information
- ✅ Migration tracking notes

---

## Backup Before Migration

```sql
-- Create backup of existing clients
CREATE TABLE clients_backup AS SELECT * FROM clients;
```

## Rollback If Needed

```sql
-- Remove all migrated clients if needed
DELETE FROM clients WHERE notes LIKE '%Migrated from Excel%';
``` 