-- Create appointment_reminders table to track sent reminders
CREATE TABLE IF NOT EXISTS appointment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    reminder_type VARCHAR(10) NOT NULL CHECK (reminder_type IN ('24h', '2h', 'custom')),
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'delivered', 'read')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_appointment_id ON appointment_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_reminder_type ON appointment_reminders(reminder_type);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_sent_at ON appointment_reminders(sent_at);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_status ON appointment_reminders(status);

-- Composite index for checking if reminder was already sent
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointment_reminders_unique 
ON appointment_reminders(appointment_id, reminder_type) 
WHERE status = 'sent';

-- Add RLS (Row Level Security) policies
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read reminder data
CREATE POLICY "Users can view appointment reminders" ON appointment_reminders
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to insert reminder data
CREATE POLICY "Users can insert appointment reminders" ON appointment_reminders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow authenticated users to update reminder data
CREATE POLICY "Users can update appointment reminders" ON appointment_reminders
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Add helpful comments
COMMENT ON TABLE appointment_reminders IS 'Tracks when appointment reminders have been sent to avoid duplicates';
COMMENT ON COLUMN appointment_reminders.appointment_id IS 'Reference to the appointment';
COMMENT ON COLUMN appointment_reminders.reminder_type IS 'Type of reminder: 24h, 2h, or custom';
COMMENT ON COLUMN appointment_reminders.sent_at IS 'When the reminder was sent';
COMMENT ON COLUMN appointment_reminders.status IS 'Status of the reminder delivery';
COMMENT ON COLUMN appointment_reminders.error_message IS 'Error message if sending failed';

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointment_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_appointment_reminders_updated_at
    BEFORE UPDATE ON appointment_reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_appointment_reminders_updated_at(); 