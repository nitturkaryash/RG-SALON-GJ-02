-- Create the stylist_holidays table if it doesn't exist
CREATE OR REPLACE FUNCTION create_stylist_holidays_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists, create it if it doesn't
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'stylist_holidays'
  ) THEN
    CREATE TABLE public.stylist_holidays (
      id UUID PRIMARY KEY,
      stylist_id UUID REFERENCES public.stylists(id) ON DELETE CASCADE,
      holiday_date DATE NOT NULL,
      reason TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    
    -- Add indexes for performance
    CREATE INDEX idx_stylist_holidays_stylist_id ON public.stylist_holidays(stylist_id);
    CREATE INDEX idx_stylist_holidays_date ON public.stylist_holidays(holiday_date);
    
    -- Add RLS policies
    ALTER TABLE public.stylist_holidays ENABLE ROW LEVEL SECURITY;
    
    -- Create policies (adjust as needed based on your auth setup)
    CREATE POLICY "Enable read access for all users" ON public.stylist_holidays
      FOR SELECT USING (true);
      
    CREATE POLICY "Enable insert for authenticated users" ON public.stylist_holidays
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      
    CREATE POLICY "Enable update for authenticated users" ON public.stylist_holidays
      FOR UPDATE USING (auth.role() = 'authenticated');
      
    CREATE POLICY "Enable delete for authenticated users" ON public.stylist_holidays
      FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END;
$$;

-- Function to update stylists who have a holiday today to be unavailable
CREATE OR REPLACE FUNCTION update_stylists_on_holiday()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set stylists with holidays today to unavailable
  UPDATE public.stylists
  SET available = false
  WHERE id IN (
    SELECT stylist_id FROM public.stylist_holidays
    WHERE holiday_date = CURRENT_DATE
  );
END;
$$;

-- Function to reset stylists who don't have holidays today back to available
-- Note: Use with caution as it may override manual availability settings
CREATE OR REPLACE FUNCTION reset_stylists_not_on_holiday()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set stylists without holidays today to available
  UPDATE public.stylists
  SET available = true
  WHERE id NOT IN (
    SELECT stylist_id FROM public.stylist_holidays
    WHERE holiday_date = CURRENT_DATE
  );
END;
$$;

-- Function to check if a stylist is on holiday for a given date
CREATE OR REPLACE FUNCTION is_stylist_on_holiday(
  p_stylist_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_on_holiday BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.stylist_holidays
    WHERE stylist_id = p_stylist_id
    AND holiday_date = p_date
  ) INTO v_is_on_holiday;
  
  RETURN v_is_on_holiday;
END;
$$;

-- Function to get all holidays for a stylist
CREATE OR REPLACE FUNCTION get_stylist_holidays(
  p_stylist_id UUID
)
RETURNS TABLE (
  id UUID,
  stylist_id UUID,
  holiday_date DATE,
  reason TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT h.id, h.stylist_id, h.holiday_date, h.reason, h.created_at
  FROM public.stylist_holidays h
  WHERE h.stylist_id = p_stylist_id
  ORDER BY h.holiday_date;
END;
$$;

-- Function to add a holiday for a stylist
CREATE OR REPLACE FUNCTION add_stylist_holiday(
  p_stylist_id UUID,
  p_holiday_date DATE,
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_holiday_id UUID;
BEGIN
  -- Generate a new UUID
  v_holiday_id := gen_random_uuid();
  
  -- Insert the holiday
  INSERT INTO public.stylist_holidays (id, stylist_id, holiday_date, reason)
  VALUES (v_holiday_id, p_stylist_id, p_holiday_date, p_reason);
  
  -- If holiday is today, update stylist availability
  IF p_holiday_date = CURRENT_DATE THEN
    UPDATE public.stylists
    SET available = false
    WHERE id = p_stylist_id;
  END IF;
  
  RETURN v_holiday_id;
END;
$$;

-- Function to remove a holiday for a stylist
CREATE OR REPLACE FUNCTION remove_stylist_holiday(
  p_holiday_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stylist_id UUID;
  v_holiday_date DATE;
BEGIN
  -- Get the stylist ID and holiday date before deleting
  SELECT stylist_id, holiday_date INTO v_stylist_id, v_holiday_date
  FROM public.stylist_holidays
  WHERE id = p_holiday_id;
  
  -- Delete the holiday
  DELETE FROM public.stylist_holidays
  WHERE id = p_holiday_id;
  
  -- If this was a holiday for today, check if there are other holidays for this stylist today
  IF v_holiday_date = CURRENT_DATE AND v_stylist_id IS NOT NULL THEN
    -- If no other holidays today, reset availability
    IF NOT EXISTS (
      SELECT 1 FROM public.stylist_holidays
      WHERE stylist_id = v_stylist_id
      AND holiday_date = CURRENT_DATE
    ) THEN
      -- You might want to consider if you should automatically set available back to true
      -- Uncomment the following if you want automatic reset
      /*
      UPDATE public.stylists
      SET available = true
      WHERE id = v_stylist_id;
      */
      NULL; -- Do nothing for now, manual reset required
    END IF;
  END IF;
  
  RETURN FOUND;
END;
$$;

-- Create a trigger to automatically update stylist availability when a holiday is added or removed
CREATE OR REPLACE FUNCTION update_stylist_availability_on_holiday_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If a holiday is being added for today
  IF TG_OP = 'INSERT' AND NEW.holiday_date = CURRENT_DATE THEN
    UPDATE public.stylists
    SET available = false
    WHERE id = NEW.stylist_id;
  -- If a holiday is being updated
  ELSIF TG_OP = 'UPDATE' THEN
    -- If the holiday date is changing to or from today
    IF (OLD.holiday_date = CURRENT_DATE OR NEW.holiday_date = CURRENT_DATE) THEN
      -- Run the update function to ensure correct availability
      PERFORM update_stylists_on_holiday();
    END IF;
  -- If a holiday is being deleted
  ELSIF TG_OP = 'DELETE' AND OLD.holiday_date = CURRENT_DATE THEN
    -- Check if there are other holidays for this stylist today
    IF NOT EXISTS (
      SELECT 1 FROM public.stylist_holidays
      WHERE stylist_id = OLD.stylist_id
      AND holiday_date = CURRENT_DATE
      AND id != OLD.id
    ) THEN
      -- No other holidays today for this stylist, could reset availability
      -- But we'll leave it manual for now
      NULL; -- Do nothing, requires manual reset
    END IF;
  END IF;
  
  -- For INSERT and UPDATE, return NEW; for DELETE, return OLD
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create triggers after the table exists
DO $$
BEGIN
  -- Create the table first if it doesn't exist
  PERFORM create_stylist_holidays_table();
  
  -- Check if triggers already exist, create them if they don't
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_update_stylist_availability_on_holiday_change'
  ) THEN
    -- Create the trigger for INSERT and UPDATE
    CREATE TRIGGER trg_update_stylist_availability_on_holiday_change
    AFTER INSERT OR UPDATE OR DELETE ON public.stylist_holidays
    FOR EACH ROW
    EXECUTE FUNCTION update_stylist_availability_on_holiday_change();
  END IF;
END;
$$; 