# Notes System Setup

This document explains how to set up the notes table in Supabase for the MyCollegeBox app.

## Database Setup

### Run the Notes Table Setup Script

Run the following SQL commands in your Supabase SQL Editor:

```sql
-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
```

## Table Structure

### Fields

- **id**: UUID (Primary Key, auto-generated)
- **user_id**: UUID (References auth.users, required)
- **title**: Text (Note title, required)
- **description**: Text (Note description, optional)
- **subject**: Text (Academic subject, required)
- **semester**: Text (Semester, optional)
- **branch**: Text (Academic branch, optional)
- **tags**: Text array (Tags for categorization, optional)
- **file_url**: Text (URL to uploaded file, required)
- **file_type**: Text (Either 'pdf' or 'image', required)
- **likes**: Integer (Number of likes, default 0)
- **downloads**: Integer (Number of downloads, default 0)
- **created_at**: Timestamp (Auto-generated)

### Security Features

- **Row Level Security (RLS)** enabled
- **Public read access**: Anyone can view and download notes
- **Private write access**: Only the uploader can create, update, or delete their notes
- **Cascade delete**: When a user is deleted, their notes are automatically deleted

### Performance Optimizations

- **Indexes** on frequently queried fields (user_id, subject, branch, semester)
- **GIN index** on tags array for efficient tag-based searches
- **Composite indexes** for sorting by likes, downloads, and creation date

## API Functions

The `notesService` provides the following functions:

### Basic CRUD Operations

- `getNotes(filters?)`: Get all notes with optional filtering
- `getNoteById(id)`: Get a single note by ID
- `getMyNotes()`: Get notes uploaded by current user
- `createNote(noteData)`: Create a new note
- `updateNote(id, updates)`: Update an existing note
- `deleteNote(id)`: Delete a note

### Engagement Features

- `likeNote(id)`: Increment like count
- `incrementDownloads(id)`: Increment download count

### Search and Discovery

- `getTrendingNotes(limit)`: Get most popular notes
- `getNotesBySubject(subject)`: Get notes by subject
- `searchNotes(searchTerm)`: Search notes by title, description, or subject

### Filtering Options

- Filter by subject, branch, semester
- Filter by tags (array overlap)
- Search by text in title, description, or subject
- Sort by creation date, likes, or downloads

## Usage Examples

### Creating a Note

```typescript
const newNote = await notesService.createNote({
  title: "Data Structures Notes",
  description: "Comprehensive notes on data structures",
  subject: "Computer Science",
  semester: "3rd Semester",
  branch: "Computer Science",
  tags: ["algorithms", "programming", "data-structures"],
  file_url: "https://example.com/file.pdf",
  file_type: "pdf",
});
```

### Getting Notes with Filters

```typescript
const notes = await notesService.getNotes({
  subject: "Computer Science",
  branch: "Computer Science",
  semester: "3rd Semester",
  search: "data structures",
});
```

### Liking a Note

```typescript
await notesService.likeNote(noteId);
```

### Downloading a Note

```typescript
await notesService.incrementDownloads(noteId);
// Then handle the actual file download
```

## File Structure

```
├── database_setup_notes.sql          # Database setup script
├── types/notes.ts                    # TypeScript interfaces
├── utils/notesService.ts             # Notes service functions
└── README_NOTES_SETUP.md             # This documentation
```

## Integration with Profiles

The notes system integrates with the profiles table to display user information:

- Notes include user details (full_name, branch, year) when fetched
- User authentication is required for creating, updating, and deleting notes
- User ownership is enforced through RLS policies

## Testing

After setup, test the following:

1. Creating a note (should work for authenticated users)
2. Reading notes (should work for everyone)
3. Updating notes (should only work for note owner)
4. Deleting notes (should only work for note owner)
5. Liking and downloading notes (should increment counters)
6. Searching and filtering notes (should work correctly)

## Notes

- File uploads should be handled separately (e.g., using Supabase Storage)
- The `file_url` field should contain the URL to the uploaded file
- Tags are stored as an array for efficient searching
- Like and download counts are simple integers (consider implementing more sophisticated tracking if needed)
- The system supports both PDF and image file types
