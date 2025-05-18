-- Add reminder_sent column to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Add index for faster reminder queries
CREATE INDEX IF NOT EXISTS idx_appointments_reminder ON appointments (start_time, reminder_sent, status); 