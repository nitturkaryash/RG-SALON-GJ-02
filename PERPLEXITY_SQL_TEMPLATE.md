# 🎯 SQL Template for Perplexity - Client Migration

## Instructions for Perplexity

**Task:** Generate PostgreSQL INSERT statements for migrating clients from Excel to Supabase database.

### Database Schema (clients table):
```sql
-- Table: clients
-- Required columns for migration:
- id (UUID, auto-generated with uuid_generate_v4())
- full_name (TEXT, NOT NULL) 
- mobile_number (VARCHAR, NOT NULL)
- phone (TEXT, can be same as mobile_number)
- gender (TEXT, nullable - 'male' or 'female')
- email (TEXT, nullable - set to NULL)
- birth_date (DATE, nullable - set to NULL) 
- anniversary_date (DATE, nullable - set to NULL)
- last_visit (TIMESTAMP, nullable - set to NULL)
- notes (TEXT, nullable - set to 'Migrated from Excel on 2025-06-25')
- total_spent (NUMERIC, default 0)
- pending_payment (NUMERIC, default 0) 
- appointment_count (INTEGER, default 0)
- created_at (TIMESTAMP, default current timestamp)
- updated_at (TIMESTAMP, default current timestamp)
```

### Excel Data Mapping:
- **firstName** (Excel) → **full_name** (Database)
- **mobileNo** (Excel) → **mobile_number** (Database) 
- **gender** (Excel) → **gender** (Database)
- **isGlobal** (Excel) → Ignore this column

### Required SQL Format:

```sql
INSERT INTO clients (
  id, full_name, mobile_number, phone, gender, email, birth_date, anniversary_date,
  last_visit, notes, total_spent, pending_payment, appointment_count,
  created_at, updated_at
) VALUES
  ('UUID_HERE', 'CLIENT_NAME_HERE', 'MOBILE_HERE', 'MOBILE_HERE', 'GENDER_HERE', NULL, NULL, NULL, NULL, 'Migrated from Excel on 2025-06-25', 0, 0, 0, '2025-06-25T07:53:56.970Z', '2025-06-25T07:53:56.970Z'),
  -- Continue for all clients...
```

### Specific Requirements:

1. **Generate unique UUIDs** for each client using proper UUID format (e.g., 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')

2. **Set phone = mobile_number** (same value for both)

3. **Use exact timestamp**: '2025-06-25T07:53:56.970Z' for both created_at and updated_at

4. **Set notes** to: 'Migrated from Excel on 2025-06-25'

5. **Handle gender values**: 
   - Convert 'male' → 'male'
   - Convert 'female' → 'female' 
   - If unclear, use 'male' as default

6. **Set all nullable fields** to NULL: email, birth_date, anniversary_date, last_visit

7. **Set numeric defaults**: total_spent = 0, pending_payment = 0, appointment_count = 0

8. **Generate ONE complete SQL statement** with all ~4,191 clients in a single INSERT

### Sample Output Format:
```sql
INSERT INTO clients (
  id, full_name, mobile_number, phone, gender, email, birth_date, anniversary_date,
  last_visit, notes, total_spent, pending_payment, appointment_count,
  created_at, updated_at
) VALUES
  ('12345678-1234-1234-1234-123456789012', 'John Doe', '9876543210', '9876543210', 'male', NULL, NULL, NULL, NULL, 'Migrated from Excel on 2025-06-25', 0, 0, 0, '2025-06-25T07:53:56.970Z', '2025-06-25T07:53:56.970Z'),
  ('23456789-2345-2345-2345-234567890123', 'Jane Smith', '9876543211', '9876543211', 'female', NULL, NULL, NULL, NULL, 'Migrated from Excel on 2025-06-25', 0, 0, 0, '2025-06-25T07:53:56.970Z', '2025-06-25T07:53:56.970Z'),
  -- ... continue for all 4,191 clients
  ('99999999-9999-9999-9999-999999999999', 'Last Client', '9999999999', '9999999999', 'female', NULL, NULL, NULL, NULL, 'Migrated from Excel on 2025-06-25', 0, 0, 0, '2025-06-25T07:53:56.970Z', '2025-06-25T07:53:56.970Z');
```

### Important Notes:
- ✅ End the SQL with semicolon (;)
- ✅ Use single quotes for all string values
- ✅ Each UUID must be unique
- ✅ No trailing comma after the last VALUES entry
- ✅ Ensure proper escaping of apostrophes in names (e.g., 'O''Connor')

### Expected Result:
A single, complete SQL INSERT statement that can be executed directly in PostgreSQL/Supabase to migrate all 4,191 clients in one operation. 