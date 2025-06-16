-- Migration: Add membership_eligible column to services table
-- This column controls whether a service can be purchased with membership balance

-- Add membership_eligible column to services table
ALTER TABLE services 
ADD COLUMN membership_eligible BOOLEAN DEFAULT true;

-- Set existing services to be membership eligible by default for backward compatibility
UPDATE services 
SET membership_eligible = true 
WHERE membership_eligible IS NULL;

-- Add comment to the column for documentation
COMMENT ON COLUMN services.membership_eligible IS 'Controls whether this service can be purchased using membership balance. Premium services should be set to false.'; 