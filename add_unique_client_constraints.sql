-- ===============================================
-- ADD UNIQUE CONSTRAINTS FOR CLIENT DUPLICATE PREVENTION
-- ===============================================
-- This script adds database-level constraints to prevent duplicate clients

-- Add unique constraint on client full_name (case-insensitive)
-- First, let's create a unique index that handles case-insensitive names
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_full_name_unique 
ON public.clients (LOWER(full_name));

-- Add unique constraint on phone number (when not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_phone_unique 
ON public.clients (phone) 
WHERE phone IS NOT NULL AND phone != '';

-- Add unique constraint on email (case-insensitive, when not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_email_unique 
ON public.clients (LOWER(email)) 
WHERE email IS NOT NULL AND email != '';

-- Add a comment to document these constraints
COMMENT ON INDEX idx_clients_full_name_unique IS 'Prevents duplicate client names (case-insensitive)';
COMMENT ON INDEX idx_clients_phone_unique IS 'Prevents duplicate phone numbers';
COMMENT ON INDEX idx_clients_email_unique IS 'Prevents duplicate email addresses (case-insensitive)';
