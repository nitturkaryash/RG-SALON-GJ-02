-- Add a flag to mark bookings made for someone else
ALTER TABLE appointments
  ADD COLUMN is_for_someone_else boolean NOT NULL DEFAULT false; 