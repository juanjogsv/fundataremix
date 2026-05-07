
CREATE TABLE public.dama_catalog (
  cod_indicador text PRIMARY KEY,
  indicador text NOT NULL,
  dimension text,
  seccion text,
  periodicidad text,
  fuente text,
  unidad_medida text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.dama_entities (
  cod_entidad text PRIMARY KEY,
  entidad text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.dama_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cod_indicador text NOT NULL,
  cod_entidad text NOT NULL,
  anio integer NOT NULL,
  categoria text,
  categoria_2 text,
  valor numeric,
  fecha_actualizacion date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dama_data_indicador ON public.dama_data(cod_indicador);
CREATE INDEX idx_dama_data_entidad ON public.dama_data(cod_entidad);
CREATE INDEX idx_dama_data_anio ON public.dama_data(anio);
CREATE INDEX idx_dama_data_lookup ON public.dama_data(cod_indicador, cod_entidad, anio);

ALTER TABLE public.dama_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dama_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dama_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read dama_catalog" ON public.dama_catalog FOR SELECT USING (true);
CREATE POLICY "Admin write dama_catalog" ON public.dama_catalog FOR ALL USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "Public read dama_entities" ON public.dama_entities FOR SELECT USING (true);
CREATE POLICY "Admin write dama_entities" ON public.dama_entities FOR ALL USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "Public read dama_data" ON public.dama_data FOR SELECT USING (true);
CREATE POLICY "Admin write dama_data" ON public.dama_data FOR ALL USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_dama_catalog_updated BEFORE UPDATE ON public.dama_catalog FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dama_entities_updated BEFORE UPDATE ON public.dama_entities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dama_data_updated BEFORE UPDATE ON public.dama_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
