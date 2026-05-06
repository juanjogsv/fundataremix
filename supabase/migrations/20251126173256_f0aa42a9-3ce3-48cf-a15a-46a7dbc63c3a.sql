-- Add categoria_3 column to education_indicators table
ALTER TABLE public.education_indicators
ADD COLUMN IF NOT EXISTS categoria_3 text;