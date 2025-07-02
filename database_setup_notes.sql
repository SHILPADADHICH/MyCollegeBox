-- Create notes table with foreign key to profiles table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    semester TEXT,
    branch TEXT,
    tags TEXT[],
    file_url TEXT NOT NULL,
    file_type TEXT CHECK (file_type IN ('pdf', 'image')) NOT NULL,
    likes INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read notes (for browsing and downloading)
CREATE POLICY "Anyone can read notes" ON public.notes
    FOR SELECT USING (true);

-- Create policy to allow only the uploader to insert notes
CREATE POLICY "Users can insert their own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow only the uploader to update their notes
CREATE POLICY "Users can update their own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow only the uploader to delete their notes
CREATE POLICY "Users can delete their own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject ON public.notes(subject);
CREATE INDEX IF NOT EXISTS idx_notes_branch ON public.notes(branch);
CREATE INDEX IF NOT EXISTS idx_notes_semester ON public.notes(semester);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_likes ON public.notes(likes DESC);
CREATE INDEX IF NOT EXISTS idx_notes_downloads ON public.notes(downloads DESC);

-- Create GIN index for tags array for efficient searching
CREATE INDEX IF NOT EXISTS idx_notes_tags ON public.notes USING GIN(tags);

-- Add comments for documentation
COMMENT ON TABLE public.notes IS 'Stores uploaded notes with metadata and engagement metrics';
COMMENT ON COLUMN public.notes.id IS 'Unique identifier for the note';
COMMENT ON COLUMN public.notes.user_id IS 'ID of the user who uploaded the note (references profiles.id)';
COMMENT ON COLUMN public.notes.title IS 'Title of the note';
COMMENT ON COLUMN public.notes.description IS 'Description or summary of the note';
COMMENT ON COLUMN public.notes.subject IS 'Academic subject of the note';
COMMENT ON COLUMN public.notes.semester IS 'Semester when the note was created';
COMMENT ON COLUMN public.notes.branch IS 'Academic branch/department';
COMMENT ON COLUMN public.notes.tags IS 'Array of tags for categorizing the note';
COMMENT ON COLUMN public.notes.file_url IS 'URL to the uploaded file';
COMMENT ON COLUMN public.notes.file_type IS 'Type of file (pdf or image)';
COMMENT ON COLUMN public.notes.likes IS 'Number of likes on the note';
COMMENT ON COLUMN public.notes.downloads IS 'Number of downloads of the note';
COMMENT ON COLUMN public.notes.created_at IS 'Timestamp when the note was created'; 