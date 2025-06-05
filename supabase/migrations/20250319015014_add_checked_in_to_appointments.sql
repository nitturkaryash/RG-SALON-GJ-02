-- Add checked_in column to appointments table
ALTER TABLE appointments
ADD COLUMN checked_in BOOLEAN DEFAULT FALSE;

-- Add index for efficient querying of checked_in status
CREATE INDEX IF NOT EXISTS idx_appointments_checked_in ON appointments(checked_in); 