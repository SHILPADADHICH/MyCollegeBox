# Supabase Storage Setup for Notes

This document explains how to set up Supabase Storage for file uploads in the MyCollegeBox app.

## Database Setup

### Run the Storage Setup Script

Run the following SQL commands in your Supabase SQL Editor:

```sql
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
```

## Storage Configuration

### Bucket Settings

- **Name**: `notes`
- **Public**: `true` (files are publicly accessible)
- **File Size Limit**: 50MB
- **Allowed MIME Types**: PDF and common image formats

### Security Policies

- **Upload**: Only authenticated users can upload files
- **View/Download**: Anyone can view and download files
- **Update**: Users can only update their own files
- **Delete**: Users can only delete their own files

### File Organization

Files are organized by user ID: `userId/timestamp_filename.ext`

## Usage Examples

### 1. Upload a File and Create a Note

```typescript
import { notesService } from "../utils/notesService";

// Example: Upload PDF and create note
const uploadNote = async (file: File) => {
  try {
    const noteData = {
      title: "Data Structures Notes",
      description: "Comprehensive notes on data structures",
      subject: "Computer Science",
      semester: "3rd Semester",
      branch: "Computer Science",
      tags: ["algorithms", "programming"],
    };

    const note = await notesService.createNoteWithFile(
      noteData,
      file,
      file.name
    );

    console.log("Note created:", note);
    console.log("File URL:", note.file_url);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

### 2. Get Public URL

```typescript
import { storageService } from "../utils/storageService";

// Get public URL for a file
const publicUrl = storageService.getPublicUrl("userId/timestamp_filename.pdf");
console.log("Public URL:", publicUrl);
```

### 3. Download a File

```typescript
import { notesService } from "../utils/notesService";

// Download a note file
const downloadNote = async (noteId: string) => {
  try {
    const fileBlob = await notesService.downloadNoteFile(noteId);

    // Handle the downloaded file
    // For React Native, you might want to save to device
    console.log("File downloaded:", fileBlob);
  } catch (error) {
    console.error("Download failed:", error);
  }
};
```

### 4. Delete a Note and File

```typescript
import { notesService } from "../utils/notesService";

// Delete note and associated file
const deleteNote = async (noteId: string) => {
  try {
    await notesService.deleteNote(noteId);
    console.log("Note and file deleted successfully");
  } catch (error) {
    console.error("Delete failed:", error);
  }
};
```

## React Native Integration

### Install Required Packages

```bash
npx expo install expo-document-picker expo-image-picker
```

### File Picker Example

```typescript
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

// Pick PDF document
const pickPDF = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/pdf",
    copyToCacheDirectory: true,
  });

  if (!result.canceled) {
    const file = result.assets[0];
    // Use with notesService.createNoteWithFile()
  }
};

// Pick image
const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled) {
    const asset = result.assets[0];
    // Convert to blob and use with notesService.createNoteWithFile()
  }
};
```

## Storage Service Functions

### Core Functions

- `uploadNoteFile(file, fileName, userId)`: Upload file and get URL
- `getPublicUrl(filePath)`: Generate public URL for file
- `downloadFile(filePath)`: Download file as blob
- `deleteNoteFile(filePath)`: Delete file from storage
- `listUserFiles(userId)`: List all files for a user
- `getFileInfo(filePath)`: Get file metadata

### File Type Detection

The service automatically detects file types:

- **PDF**: `application/pdf` or `.pdf` extension
- **Image**: `image/*` MIME types or image extensions

## Integration with Notes System

### Automatic File Management

- Files are automatically uploaded when creating notes
- File URLs are stored in the notes table
- Files are automatically deleted when notes are deleted
- Download counts are tracked automatically

### Error Handling

- If note creation fails, uploaded files are automatically deleted
- If note update fails, new files are deleted and old files are preserved
- Comprehensive error logging for debugging

## Security Considerations

### File Access

- Files are publicly accessible (no authentication required for viewing)
- Only authenticated users can upload files
- Users can only modify/delete their own files

### File Validation

- File size limit: 50MB
- Allowed file types: PDF, JPEG, PNG, GIF, WebP
- File type detection based on MIME type and extension

### Storage Organization

- Files are organized by user ID to prevent conflicts
- Timestamp prefixes ensure unique filenames
- Automatic cleanup when users are deleted

## Performance Optimizations

### Caching

- Files are cached for 1 hour (3600 seconds)
- Public URLs are generated instantly
- No database queries required for file access

### File Management

- Efficient file deletion with cascade cleanup
- Minimal storage overhead with proper organization
- Automatic file type detection

## Testing

### Test Upload

1. Create a test note with file upload
2. Verify file is accessible via public URL
3. Check file appears in user's file list

### Test Download

1. Download a note file
2. Verify download count increments
3. Check file content is correct

### Test Deletion

1. Delete a note
2. Verify associated file is also deleted
3. Check file is no longer accessible

## Troubleshooting

### Common Issues

1. **Upload fails**: Check file size and type restrictions
2. **URL not accessible**: Verify bucket is public
3. **Permission denied**: Check RLS policies
4. **File not found**: Verify file path is correct

### Debug Steps

1. Check Supabase Storage dashboard
2. Verify RLS policies are active
3. Test with simple file upload
4. Check console logs for errors

## File Structure

```
├── database_setup_storage.sql          # Storage setup script
├── utils/storageService.ts             # Storage service functions
├── utils/notesService.ts               # Updated notes service
├── examples/fileUploadExample.tsx      # Usage example
└── README_STORAGE_SETUP.md             # This documentation
```

## Next Steps

1. **Run the storage setup script** in Supabase SQL Editor
2. **Test file uploads** using the example component
3. **Integrate with your UI** for note creation and management
4. **Add file preview functionality** for PDFs and images
5. **Implement download tracking** and analytics

The storage system is now ready to handle file uploads, downloads, and management for your notes application! 📁✨
