-- Add categoria and categoria_2 columns to education_indicators table
ALTER TABLE public.education_indicators
ADD COLUMN IF NOT EXISTS categoria text,
ADD COLUMN IF NOT EXISTS categoria_2 text;