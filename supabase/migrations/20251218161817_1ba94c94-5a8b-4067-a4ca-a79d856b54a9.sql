-- Create table for rural beneficiaries data
CREATE TABLE public.rural_beneficiaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  base TEXT,
  seccion TEXT NOT NULL,
  programa TEXT,
  departamento TEXT,
  cod_entidad TEXT,
  entidad TEXT,
  categoria TEXT DEFAULT 'Total Beneficiarios',
  valor NUMERIC,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rural_beneficiaries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to rural beneficiaries" 
ON public.rural_beneficiaries 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert rural beneficiaries" 
ON public.rural_beneficiaries 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update rural beneficiaries" 
ON public.rural_beneficiaries 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete rural beneficiaries" 
ON public.rural_beneficiaries 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rural_beneficiaries_updated_at
BEFORE UPDATE ON public.rural_beneficiaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();