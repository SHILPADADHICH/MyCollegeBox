# MyCollegeBox - Complete College Notes Sharing Platform

A comprehensive React Native app built with Expo that allows college students to share, discover, and download academic notes. The app integrates Supabase for backend services including authentication, database, and file storage.

## 🚀 Features

### 🔐 Authentication & Profiles

- **User Registration & Login**: Secure authentication with Supabase Auth
- **Profile Management**: Complete user profiles with personal information
- **Gender-based Avatars**: Dynamic profile icons based on user gender
- **Profile Editing**: Update personal information, branch, year, etc.

### 📚 Notes Management

- **Upload Notes**: Support for PDF and image files
- **Note Details**: Title, description, subject, semester, branch, tags
- **File Storage**: Secure file upload to Supabase Storage
- **Note Discovery**: Browse, search, and filter notes
- **Download Tracking**: Track download counts for each note
- **Like System**: Like and unlike notes
- **Trending Notes**: View most popular notes on homepage

### 🔍 Search & Discovery

- **Global Search**: Search notes by title, subject, or tags
- **Advanced Filtering**: Filter by file type, subject, branch
- **Explore Page**: Browse all notes with list/grid views
- **Search Results**: Dedicated search page with results

### 📱 User Interface

- **Modern Design**: Clean, intuitive interface with consistent styling
- **Responsive Layout**: Works on various screen sizes
- **Loading States**: Proper loading indicators throughout the app
- **Error Handling**: User-friendly error messages
- **Empty States**: Helpful messages when no content is available

## 🛠 Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Navigation**: Expo Router
- **Icons**: Expo Vector Icons
- **File Handling**: Expo Document Picker & Image Picker
- **Language**: TypeScript

## 📋 Database Schema

### Profiles Table

```sql
- id (UUID, Primary Key)
- full_name (Text)
- branch (Text, nullable)
- year (Text, nullable)
- gender (Text, nullable)
- account_type (Text, nullable)
- pg_name (Text, nullable)
- created_at (Timestamp)
```

### Notes Table

```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to profiles)
- title (Text)
- description (Text, nullable)
- subject (Text)
- semester (Text, nullable)
- branch (Text, nullable)
- tags (Text Array, nullable)
- file_url (Text)
- file_type (Text: 'pdf' or 'image')
- likes (Integer, default 0)
- downloads (Integer, default 0)
- created_at (Timestamp)
```

### Note Likes Table

```sql
- id (UUID, Primary Key)
- note_id (UUID, Foreign Key to notes)
- user_id (UUID, Foreign Key to profiles)
- created_at (Timestamp)
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd MyCollegeBox
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   - Create a new Supabase project
   - Run the SQL scripts from `database_setup_storage.sql`
   - Configure storage bucket and policies

4. **Configure environment variables**
   Create a `.env` file in the root directory:

   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

## 📱 App Structure

### Core Pages

- **Homepage** (`/homepage`): Dashboard with trending notes and quick actions
- **Explore** (`/explore`): Browse all notes with search and filters
- **Upload Notes** (`/upload-notes`): Upload new notes with file selection
- **Note Details** (`/note/[id]`): View note details and download
- **Profile** (`/profile`): User profile with uploaded notes
- **Search** (`/search`): Dedicated search page
- **Edit Profile** (`/edit-profile`): Edit user profile information

### Authentication Pages

- **Sign Up** (`/(auth)/signup`): User registration
- **Sign In** (`/(auth)/signin`): User login

### Components

- **ProfileIcon**: Dynamic avatar based on gender
- **Auth/Onboarding**: Authentication flow components

### Services

- **supabase.ts**: Supabase client configuration
- **profileService.ts**: Profile management operations
- **notesService.ts**: Notes CRUD operations
- **storageService.ts**: File upload/download operations

## 🔧 Key Features Implementation

### File Upload

```typescript
// Upload a note with file
const note = await notesService.createNoteWithFile(
  {
    title: "My Note",
    description: "Note description",
    subject: "Computer Science",
    semester: "3rd Semester",
    branch: "Computer Science",
    tags: ["algorithms", "programming"],
  },
  selectedFile,
  fileName
);
```

### Search Notes

```typescript
// Search notes by keyword
const results = await notesService.searchNotes("algorithms");
```

### Download Notes

```typescript
// Download a note file
await notesService.downloadNoteFile(noteId);
```

### Like/Unlike Notes

```typescript
// Like a note
await notesService.likeNote(noteId);

// Unlike a note
await notesService.unlikeNote(noteId);
```

## 🔒 Security Features

### Row Level Security (RLS)

- **Profiles**: Users can only read/update their own profile
- **Notes**: Public read access, restricted write access to owners
- **Note Likes**: Users can only manage their own likes

### Storage Policies

- **Public Access**: Notes bucket allows public read access
- **Authenticated Upload**: Only authenticated users can upload files
- **Owner-based Deletion**: Users can only delete their own files

## 📊 Analytics & Tracking

- **Download Counts**: Track how many times each note is downloaded
- **Like Counts**: Track user engagement with notes
- **User Statistics**: Profile page shows user's note count, total downloads, and likes

## 🎨 UI/UX Features

### Design System

- **Color Palette**: Consistent blue (#4D8DFF) and red (#FF6B6B) theme
- **Typography**: Clear hierarchy with proper font weights
- **Spacing**: Consistent padding and margins throughout
- **Shadows**: Subtle elevation for cards and components

### User Experience

- **Loading States**: Activity indicators for all async operations
- **Error Handling**: User-friendly error messages with retry options
- **Empty States**: Helpful messages when no content is available
- **Navigation**: Intuitive navigation with back buttons and breadcrumbs

## 🚀 Deployment

### Expo Build

```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios

# Build for web
expo build:web
```

### Supabase Deployment

- Database changes are applied through SQL scripts
- Storage bucket configuration is handled through Supabase dashboard
- RLS policies ensure data security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the documentation in the `README_*` files
- Review the SQL setup scripts
- Check the example files in the `examples/` directory

## 🔄 Future Enhancements

- **Real-time Notifications**: Push notifications for new notes
- **Comments System**: Allow users to comment on notes
- **Advanced Search**: Full-text search with filters
- **Offline Support**: Cache notes for offline viewing
- **Social Features**: Follow other users, share notes
- **Analytics Dashboard**: Detailed usage statistics
- **Mobile App**: Native iOS/Android apps
