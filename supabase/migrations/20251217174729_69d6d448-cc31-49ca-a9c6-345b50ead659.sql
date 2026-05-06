-- Add new columns to calendar_events table for full event management
ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS categoria text,
ADD COLUMN IF NOT EXISTS lugar text,
ADD COLUMN IF NOT EXISTS hora text;

-- Add comment for documentation
COMMENT ON COLUMN public.calendar_events.categoria IS 'Event category (Educación, Emprendimiento, etc.)';
COMMENT ON COLUMN public.calendar_events.lugar IS 'Physical location or virtual link';
COMMENT ON COLUMN public.calendar_events.hora IS 'Event time in string format';