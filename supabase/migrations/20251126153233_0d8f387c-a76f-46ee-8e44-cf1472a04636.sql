-- Create table for education beneficiaries (Subsection 1)
CREATE TABLE IF NOT EXISTS public.education_beneficiaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  programa TEXT NOT NULL,
  departamento TEXT NOT NULL,
  categoria TEXT,
  valor NUMERIC,
  year INTEGER NOT NULL DEFAULT 2025,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for education indicators (Subsections 2-7)
CREATE TABLE IF NOT EXISTS public.education_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seccion TEXT NOT NULL, -- Will store: "Aprendamos Todos a Leer", "Matrícula técnica UTC", etc.
  indicador TEXT NOT NULL,
  descripcion TEXT,
  valor NUMERIC,
  unidad TEXT,
  meta NUMERIC,
  cumplimiento NUMERIC,
  departamento TEXT,
  municipio TEXT,
  year INTEGER NOT NULL DEFAULT 2024,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.education_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_indicators ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to education beneficiaries"
ON public.education_beneficiaries
FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to education indicators"
ON public.education_indicators
FOR SELECT
USING (true);

-- Create policies for admin write access
CREATE POLICY "Admins can insert education beneficiaries"
ON public.education_beneficiaries
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update education beneficiaries"
ON public.education_beneficiaries
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete education beneficiaries"
ON public.education_beneficiaries
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert education indicators"
ON public.education_indicators
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update education indicators"
ON public.education_indicators
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete education indicators"
ON public.education_indicators
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_education_beneficiaries_year ON public.education_beneficiaries(year);
CREATE INDEX IF NOT EXISTS idx_education_beneficiaries_programa ON public.education_beneficiaries(programa);
CREATE INDEX IF NOT EXISTS idx_education_indicators_year ON public.education_indicators(year);
CREATE INDEX IF NOT EXISTS idx_education_indicators_seccion ON public.education_indicators(seccion);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_education_beneficiaries_updated_at
BEFORE UPDATE ON public.education_beneficiaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_education_indicators_updated_at
BEFORE UPDATE ON public.education_indicators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();