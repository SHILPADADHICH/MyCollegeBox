-- Create Storage bucket for notes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'notes',
  'notes',
  true,
  52428800, -- 50MB file size limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create storage policy to allow authenticated users to upload files
CREATE POLICY "Users can upload notes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'notes' AND 
    auth.role() = 'authenticated'
  );

-- Create storage policy to allow anyone to view/download files
CREATE POLICY "Anyone can view notes" ON storage.objects
  FOR SELECT USING (bucket_id = 'notes');

-- Create storage policy to allow users to update their own files
CREATE POLICY "Users can update their own notes" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'notes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policy to allow users to delete their own files
CREATE POLICY "Users can delete their own notes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'notes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  ); 