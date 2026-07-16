GRANT SELECT ON public.bd_datos_cache TO anon;
DROP POLICY IF EXISTS "Public read bd_datos_cache" ON public.bd_datos_cache;
CREATE POLICY "Public read bd_datos_cache" ON public.bd_datos_cache FOR SELECT TO anon, authenticated USING (true);