GRANT SELECT ON public.participants TO anon;
DROP POLICY IF EXISTS "Public read participants" ON public.participants;
CREATE POLICY "Public read participants" ON public.participants FOR SELECT TO anon, authenticated USING (true);