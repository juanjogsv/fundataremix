-- Create table for historical social investment data
CREATE TABLE public.social_investment_historical (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  tipo TEXT NOT NULL, -- 'Propios' or 'Terceros'
  valor NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(year, tipo)
);

-- Enable RLS
ALTER TABLE public.social_investment_historical ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to social investment historical"
ON public.social_investment_historical
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert social investment historical"
ON public.social_investment_historical
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update social investment historical"
ON public.social_investment_historical
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete social investment historical"
ON public.social_investment_historical
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));