-- Add reminder tracking columns to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_2h_sent BOOLEAN DEFAULT false;

-- Keep the old reminder_sent column for backward compatibility
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Add indexes for faster reminder queries
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_24h ON appointments (start_time, reminder_24h_sent, status);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_2h ON appointments (start_time, reminder_2h_sent, status);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder ON appointments (start_time, reminder_sent, status); 