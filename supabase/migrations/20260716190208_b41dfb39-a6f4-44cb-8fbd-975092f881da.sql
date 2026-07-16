
-- =========================================================================
-- 1. Tabla codigos_acceso
-- =========================================================================
CREATE TABLE public.codigos_acceso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_hash TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Solo service_role puede leer/escribir (edge function). Sin GRANT a anon/authenticated.
GRANT ALL ON public.codigos_acceso TO service_role;

ALTER TABLE public.codigos_acceso ENABLE ROW LEVEL SECURITY;

-- Nadie (ni anon ni authenticated) puede consultarla desde el Data API.
-- service_role bypasea RLS automáticamente.
CREATE POLICY "codigos_acceso denies all client access"
ON public.codigos_acceso
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- =========================================================================
-- 2. Reemplazar policies SELECT permisivas (public/true) por policies
--    específicas por rol.
-- =========================================================================

-- ---- TABLAS PÚBLICAS (anon + authenticated pueden leer) ----
DO $$
DECLARE t text;
DECLARE public_tables text[] := ARRAY[
  'education_beneficiaries','education_indicators',
  'dama_data','dama_catalog','dama_entities',
  'mcv_indicators',
  'eap_historical_indicators','entrepreneurship_indicators',
  'rural_beneficiaries','rural_development_indicators',
  'special_projects_indicators'
];
DECLARE p record;
BEGIN
  FOREACH t IN ARRAY public_tables LOOP
    -- Drop cualquier policy SELECT existente sobre role public
    FOR p IN
      SELECT policyname FROM pg_policies
       WHERE schemaname='public' AND tablename=t AND cmd='SELECT'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY "Public read for anon and authenticated" ON public.%I FOR SELECT TO anon, authenticated USING (true)',
      t
    );

    -- Asegurar GRANT (anon SELECT + authenticated CRUD + service_role ALL)
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;

-- ---- TABLAS PROTEGIDAS (solo authenticated puede leer) ----
DO $$
DECLARE t text;
DECLARE protected_tables text[] := ARRAY[
  'strategic_indicators',
  'social_investment','social_investment_historical',
  'financial_execution_monthly','operating_expenses_monthly',
  'calendar_events',
  'documents','document_categories',
  'library_publications',
  'map_locations',
  'participants',
  'bd_catalogo_entidades','bd_catalogo_indicadores','bd_datos_cache','bd_sync_meta'
];
DECLARE p record;
BEGIN
  FOREACH t IN ARRAY protected_tables LOOP
    -- Drop cualquier policy SELECT existente (todas hoy son "public true")
    FOR p IN
      SELECT policyname FROM pg_policies
       WHERE schemaname='public' AND tablename=t AND cmd='SELECT'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY "Authenticated read only" ON public.%I FOR SELECT TO authenticated USING (true)',
      t
    );

    -- Revocar SELECT del rol anon si existiera y garantizar grants correctos
    EXECUTE format('REVOKE SELECT ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;
