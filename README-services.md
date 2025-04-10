# Setting up Services in the POS System

This document provides instructions for setting up the services table in your Supabase database to ensure that services appear correctly in the POS system walk-in tab.

## Services Table Setup

The POS system now uses a `services` table to load services dynamically instead of using hardcoded values. Follow these steps to ensure your services are properly configured:

### Option 1: Using the SQL Editor in Supabase

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the following SQL code:

```sql
-- Check if services table exists, and create it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'services') THEN
        CREATE TABLE services (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            duration INTEGER NOT NULL,
            price NUMERIC NOT NULL,
            category TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Insert some sample data
        INSERT INTO services (id, name, description, duration, price, category) VALUES
        (uuid_generate_v4(), 'Men''s Haircut', 'Classic men''s haircut and styling', 30, 3000.00, 'Haircut'),
        (uuid_generate_v4(), 'Women''s Haircut', 'Women''s haircut and styling', 60, 5000.00, 'Haircut'),
        (uuid_generate_v4(), 'Hair Coloring', 'Full hair coloring service', 120, 10000.00, 'Color'),
        (uuid_generate_v4(), 'Blowout & Styling', 'Hair blowout and professional styling', 45, 4000.00, 'Styling'),
        (uuid_generate_v4(), 'Hair Treatment', 'Deep conditioning treatment for damaged hair', 60, 6000.00, 'Treatment');
        
        RAISE NOTICE 'Services table created with sample data';
    ELSE
        RAISE NOTICE 'Services table already exists';
    END IF;
END
$$;
```

5. Run the query

### Option 2: Use the Application

1. The services implementation includes a fallback to mock data if the database table is empty or doesn't exist
2. The application will also try to automatically create services from the mock data
3. Services can be managed directly from the application if you have administrator access

## Troubleshooting

If services are not appearing in the POS walk-in tab:

1. Check browser console logs for any errors
2. Verify that the services table exists in your Supabase database
3. Check that you have services data in the table
4. Ensure your Supabase credentials are correct in your environment variables

## Fields in the Services Table

The services table contains the following fields:

- `id`: Unique identifier for the service (UUID)
- `name`: Name of the service (required)
- `description`: Description of the service (optional)
- `duration`: Duration of the service in minutes (required)
- `price`: Price of the service (required)
- `category`: Category the service belongs to (optional)
- `created_at`: Timestamp when the service was created
- `updated_at`: Timestamp when the service was last updated

## Adding New Services

You can add new services either:

1. Directly in the Supabase table editor
2. Through the application if it has a services management interface
3. Using SQL queries in the Supabase SQL editor

Example SQL to add a new service:

```sql
INSERT INTO services (id, name, description, duration, price, category)
VALUES (
    uuid_generate_v4(),
    'Facial Treatment',
    'Rejuvenating facial treatment',
    60,
    8000.00,
    'Facial'
);
``` 