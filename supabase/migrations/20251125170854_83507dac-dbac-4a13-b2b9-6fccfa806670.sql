-- Crear tabla para inversión social
CREATE TABLE IF NOT EXISTS public.social_investment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  category TEXT NOT NULL,
  budget_2025 NUMERIC NOT NULL,
  executed NUMERIC NOT NULL DEFAULT 0,
  pending NUMERIC NOT NULL DEFAULT 0,
  execution_percentage NUMERIC NOT NULL DEFAULT 0,
  is_parent BOOLEAN NOT NULL DEFAULT false,
  parent_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.social_investment ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público para lectura
CREATE POLICY "Allow public read access to social investment"
ON public.social_investment
FOR SELECT
USING (true);

-- Políticas de administración
CREATE POLICY "Admins can insert social investment"
ON public.social_investment
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update social investment"
ON public.social_investment
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete social investment"
ON public.social_investment
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para actualizar updated_at
CREATE TRIGGER update_social_investment_updated_at
BEFORE UPDATE ON public.social_investment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Crear índice para mejorar búsquedas
CREATE INDEX idx_social_investment_category ON public.social_investment(category);
CREATE INDEX idx_social_investment_parent ON public.social_investment(is_parent);