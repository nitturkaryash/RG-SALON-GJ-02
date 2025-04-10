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