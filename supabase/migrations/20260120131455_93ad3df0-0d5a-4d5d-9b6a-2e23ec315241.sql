-- Create storage bucket for library publication documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('library-documents', 'library-documents', true);

-- Allow anyone to view/download documents (public bucket)
CREATE POLICY "Public can view library documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'library-documents');

-- Allow admins to upload documents
CREATE POLICY "Admins can upload library documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'library-documents' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update documents
CREATE POLICY "Admins can update library documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'library-documents' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete documents
CREATE POLICY "Admins can delete library documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'library-documents' 
  AND public.has_role(auth.uid(), 'admin')
);