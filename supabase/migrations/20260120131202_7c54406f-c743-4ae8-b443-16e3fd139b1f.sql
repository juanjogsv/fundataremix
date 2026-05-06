-- Create storage bucket for library publication covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('library-covers', 'library-covers', true);

-- Allow anyone to view covers (public bucket)
CREATE POLICY "Public can view library covers"
ON storage.objects
FOR SELECT
USING (bucket_id = 'library-covers');

-- Allow admins to upload covers
CREATE POLICY "Admins can upload library covers"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'library-covers' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update covers
CREATE POLICY "Admins can update library covers"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'library-covers' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete covers
CREATE POLICY "Admins can delete library covers"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'library-covers' 
  AND public.has_role(auth.uid(), 'admin')
);