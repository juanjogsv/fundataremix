-- Create library_publications table for the Biblioteca section
CREATE TABLE public.library_publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  cover_image_url TEXT,
  external_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.library_publications ENABLE ROW LEVEL SECURITY;

-- Anyone can read publications (public content)
CREATE POLICY "Publications are viewable by everyone"
  ON public.library_publications
  FOR SELECT
  USING (true);

-- Only admins can insert/update/delete (using correct parameter order)
CREATE POLICY "Admins can insert publications"
  ON public.library_publications
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update publications"
  ON public.library_publications
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete publications"
  ON public.library_publications
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_library_publications_updated_at
  BEFORE UPDATE ON public.library_publications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();