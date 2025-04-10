-- Check if tables don't exist before creating them
DO $$
BEGIN
  -- Create service_collections table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'service_collections') THEN
    CREATE TABLE service_collections (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Disable RLS or create a permissive policy
    ALTER TABLE service_collections DISABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Created service_collections table';
  ELSE
    RAISE NOTICE 'service_collections table already exists';
    -- Ensure RLS is disabled
    ALTER TABLE service_collections DISABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Create collection_services table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'collection_services') THEN
    CREATE TABLE collection_services (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      collection_id UUID REFERENCES service_collections(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Disable RLS or create a permissive policy
    ALTER TABLE collection_services DISABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Created collection_services table';
  ELSE
    RAISE NOTICE 'collection_services table already exists';
    -- Ensure RLS is disabled
    ALTER TABLE collection_services DISABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Create services table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'services') THEN
    CREATE TABLE services (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      duration INTEGER NOT NULL,
      price INTEGER NOT NULL,
      category TEXT,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Disable RLS or create a permissive policy
    ALTER TABLE services DISABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Created services table';
  ELSE
    RAISE NOTICE 'services table already exists';
    -- Ensure RLS is disabled
    ALTER TABLE services DISABLE ROW LEVEL SECURITY;
  END IF;

END $$; 