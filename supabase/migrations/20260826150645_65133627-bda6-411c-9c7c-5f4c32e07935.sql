-- Lectura pública (anon) para el contenido del dashboard
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'calendar_events','document_categories','documents','library_publications',
    'map_locations','strategic_indicators','social_investment',
    'social_investment_historical','financial_execution_monthly','operating_expenses_monthly'
  ] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', t);
    EXECUTE format('DROP POLICY IF EXISTS "Public read %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "Public read %1$s" ON public.%1$I FOR SELECT TO anon, authenticated USING (true)', t);
  END LOOP;
END $$;
