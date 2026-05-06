-- Create rural development indicators table
CREATE TABLE public.rural_development_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seccion TEXT NOT NULL,
  indicador TEXT NOT NULL,
  categoria TEXT DEFAULT 'Total',
  valor NUMERIC,
  meta NUMERIC,
  cumplimiento NUMERIC,
  year INTEGER NOT NULL DEFAULT 2024,
  unidad_medida TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rural_development_indicators ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to rural development indicators" 
ON public.rural_development_indicators 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert rural development indicators" 
ON public.rural_development_indicators 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update rural development indicators" 
ON public.rural_development_indicators 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete rural development indicators" 
ON public.rural_development_indicators 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for timestamps
CREATE TRIGGER update_rural_development_indicators_updated_at
BEFORE UPDATE ON public.rural_development_indicators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();