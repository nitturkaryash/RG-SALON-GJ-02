-- Check if the stylists table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stylists') THEN
        -- Create the stylists table
        CREATE TABLE stylists (
            id UUID PRIMARY KEY,
            name TEXT NOT NULL,
            specialties TEXT[] DEFAULT '{}',
            bio TEXT,
            gender TEXT CHECK (gender IN ('male', 'female', 'other')),
            available BOOLEAN DEFAULT true,
            imageUrl TEXT,
            email TEXT,
            phone TEXT,
            breaks JSONB DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Insert sample stylists
        INSERT INTO stylists (id, name, specialties, bio, gender, available, imageUrl, email, phone, breaks)
        VALUES 
        (
            uuid_generate_v4(),
            'Emma Johnson',
            ARRAY['Haircut', 'Styling', 'Color'],
            'Experienced hair stylist specializing in modern cuts and vibrant colors.',
            'female',
            true,
            'https://ui-avatars.com/api/?name=Emma+Johnson&background=6B8E23&color=fff&size=150',
            'emma@salon.com',
            '555-123-4567',
            '[]'::jsonb
        ),
        (
            uuid_generate_v4(),
            'Michael Chen',
            ARRAY['Haircut', 'Beard Trim', 'Men''s Styling'],
            'Master barber with 8 years of experience in men''s grooming.',
            'male',
            true,
            'https://ui-avatars.com/api/?name=Michael+Chen&background=6B8E23&color=fff&size=150',
            'michael@salon.com',
            '555-234-5678',
            '[]'::jsonb
        ),
        (
            uuid_generate_v4(),
            'Sophia Rodriguez',
            ARRAY['Color', 'Highlights', 'Balayage'],
            'Color specialist with a passion for creating beautiful, natural-looking hair.',
            'female',
            true,
            'https://ui-avatars.com/api/?name=Sophia+Rodriguez&background=6B8E23&color=fff&size=150',
            'sophia@salon.com',
            '555-345-6789',
            '[]'::jsonb
        );

        RAISE NOTICE 'Stylists table created with sample data.';
    ELSE
        RAISE NOTICE 'Stylists table already exists.';
    END IF;
END $$; 