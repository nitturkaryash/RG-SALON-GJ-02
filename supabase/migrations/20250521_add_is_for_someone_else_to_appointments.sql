-- Add booker information columns to appointments table
ALTER TABLE appointments
  ADD COLUMN booker_name text,
  ADD COLUMN booker_phone text,
  ADD COLUMN booker_email text; 