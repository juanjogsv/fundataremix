-- Create table for special projects indicators
CREATE TABLE public.special_projects_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  base TEXT DEFAULT 'Proyectos especiales',
  seccion TEXT NOT NULL,
  cod_indicador TEXT NOT NULL,
  indicador TEXT NOT NULL,
  categoria TEXT NOT NULL,
  cod_entidad TEXT,
  entidad TEXT,
  dato NUMERIC,
  year INTEGER NOT NULL,
  periodicidad TEXT DEFAULT 'Anual',
  mes_trimestre TEXT DEFAULT 'Na',
  fuente TEXT,
  unidad_medida TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.special_projects_indicators ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to special projects indicators"
  ON public.special_projects_indicators
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert special projects indicators"
  ON public.special_projects_indicators
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update special projects indicators"
  ON public.special_projects_indicators
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete special projects indicators"
  ON public.special_projects_indicators
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_special_projects_indicators_updated_at
  BEFORE UPDATE ON public.special_projects_indicators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();