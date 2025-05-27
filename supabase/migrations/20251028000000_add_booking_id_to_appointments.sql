-- Add booking_id column to public.appointments table
ALTER TABLE public.appointments
ADD COLUMN booking_id UUID NULL;

COMMENT ON COLUMN public.appointments.booking_id IS 'Identifier to group multiple appointment entries that belong to a single logical booking operation, e.g., for multiple services/stylists booked together.'; 