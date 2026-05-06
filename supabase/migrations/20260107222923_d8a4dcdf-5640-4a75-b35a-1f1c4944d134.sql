-- Add missing columns to participants table
ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS cod_entidad TEXT,
ADD COLUMN IF NOT EXISTS entidad TEXT;