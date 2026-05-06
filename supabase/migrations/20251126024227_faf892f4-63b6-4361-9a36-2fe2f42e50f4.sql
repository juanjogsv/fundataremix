-- Add year field to strategic_indicators table to support multi-year data
ALTER TABLE public.strategic_indicators 
ADD COLUMN IF NOT EXISTS year INTEGER NOT NULL DEFAULT 2025;

-- Create index for faster year-based queries
CREATE INDEX IF NOT EXISTS idx_strategic_indicators_year 
ON public.strategic_indicators(year);

-- Add comment for documentation
COMMENT ON COLUMN public.strategic_indicators.year IS 'Year the indicator data corresponds to (2023, 2024, 2025, etc.)';