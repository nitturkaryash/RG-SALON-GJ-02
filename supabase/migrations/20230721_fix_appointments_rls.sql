-- Enable RLS for appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all appointments
CREATE POLICY "Allow authenticated users to read appointments"
ON appointments FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow authenticated users to insert appointments
CREATE POLICY "Allow authenticated users to insert appointments"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update appointments
CREATE POLICY "Allow authenticated users to update appointments"
ON appointments FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to delete appointments
CREATE POLICY "Allow authenticated users to delete appointments"
ON appointments FOR DELETE
TO authenticated
USING (true);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON appointments TO authenticated;

-- Create policy to allow authenticated users to read appointment_services
CREATE POLICY "Allow authenticated users to read appointment_services"
ON appointment_services FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow authenticated users to read appointment_stylists
CREATE POLICY "Allow authenticated users to read appointment_stylists"
ON appointment_stylists FOR SELECT
TO authenticated
USING (true);

-- Grant necessary permissions to authenticated users for join tables
GRANT SELECT ON appointment_services TO authenticated;
GRANT SELECT ON appointment_stylists TO authenticated; 