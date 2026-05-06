-- Create table for MCV (Contexto Socioeconómico) indicators
CREATE TABLE public.mcv_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  base TEXT DEFAULT 'Contexto socioeconómico',
  seccion TEXT NOT NULL,
  cod_indicador TEXT NOT NULL,
  indicador TEXT NOT NULL,
  categoria TEXT DEFAULT 'Total',
  cod_entidad TEXT,
  entidad TEXT NOT NULL,
  dato NUMERIC,
  year INTEGER NOT NULL,
  periodicidad TEXT DEFAULT 'anual',
  mes_trimestre TEXT DEFAULT 'na',
  fuente TEXT,
  unidad_medida TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mcv_indicators ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to MCV indicators" 
ON public.mcv_indicators 
FOR SELECT 
USING (true);

-- Admin policies
CREATE POLICY "Admins can insert MCV indicators" 
ON public.mcv_indicators 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update MCV indicators" 
ON public.mcv_indicators 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete MCV indicators" 
ON public.mcv_indicators 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for common queries
CREATE INDEX idx_mcv_entidad ON public.mcv_indicators(entidad);
CREATE INDEX idx_mcv_seccion ON public.mcv_indicators(seccion);
CREATE INDEX idx_mcv_year ON public.mcv_indicators(year);
CREATE INDEX idx_mcv_cod_indicador ON public.mcv_indicators(cod_indicador);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mcv_indicators_updated_at
BEFORE UPDATE ON public.mcv_indicators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();