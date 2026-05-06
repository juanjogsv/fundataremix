-- Create table for EAP historical indicators
CREATE TABLE public.eap_historical_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  indicator_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  value NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(indicator_name, year)
);

-- Enable Row Level Security
ALTER TABLE public.eap_historical_indicators ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to EAP historical indicators" 
ON public.eap_historical_indicators 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert EAP historical indicators" 
ON public.eap_historical_indicators 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update EAP historical indicators" 
ON public.eap_historical_indicators 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete EAP historical indicators" 
ON public.eap_historical_indicators 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));