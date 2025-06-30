import { supabase } from "./supabase";
import {
  Note,
  NoteCreate,
  NoteUpdate,
  NoteWithUser,
  NoteFilters,
} from "../types/notes";
import { storageService, UploadResult } from "./storageService";
import { profileService } from "./profileService";

export const notesService = {
  // Get all notes with optional filters
  async getNotes(filters?: NoteFilters): Promise<NoteWithUser[]> {
    try {
      // First try the proper join approach
      let query = supabase
        .from("notes")
        .select(
          `
          *,
          user:profiles(full_name, branch, year)
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.subject) {
        query = query.eq("subject", filters.subject);
      }
      if (filters?.branch) {
        query = query.eq("branch", filters.branch);
      }
      if (filters?.semester) {
        query = query.eq("semester", filters.semester);
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags);
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (!error) {
        return data || [];
      }

      // If foreign key relationship error occurs, use alternative approach
      console.log("Falling back to alternative query method for getNotes");
      
      // Get notes first
      let notesQuery = supabase
        .from("notes")
        .select('*')
        .order("created_at", { ascending: false });
        
      // Apply the same filters
      if (filters?.subject) {
        notesQuery = notesQuery.eq("subject", filters.subject);
      }
      if (filters?.branch) {
        notesQuery = notesQuery.eq("branch", filters.branch);
      }
      if (filters?.semester) {
        notesQuery = notesQuery.eq("semester", filters.semester);
      }
      if (filters?.tags && filters.tags.length > 0) {
        notesQuery = notesQuery.overlaps("tags", filters.tags);
      }
      if (filters?.search) {
        notesQuery = notesQuery.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }
      
      const { data: notesData, error: notesError } = await notesQuery;
      
      if (notesError) {
        console.error("Error fetching notes with filters:", notesError);
        throw new Error("Failed to fetch notes");
      }
      
      // Then manually fetch user data for each note
      const enhancedNotes = await Promise.all((notesData || []).map(async (note) => {
        try {
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name, branch, year")
            .eq("id", note.user_id)
            .single();
            
          return {
            ...note,
            user: userData || { full_name: "Anonymous", branch: "", year: "" }
          };
        } catch (err) {
          console.log(`Could not fetch user data for note ${note.id}`, err);
          return {
            ...note,
            user: { full_name: "Anonymous", branch: "", year: "" }
          };
        }
      }));
      
      return enhancedNotes;
    } catch (error) {
      console.error("Error in getNotes:", error);
      throw new Error("Failed to fetch notes");
    }
  },

  // Get a single note by ID
  async getNoteById(id: string): Promise<NoteWithUser | null> {
    try {
      // First try the proper join approach
      const { data, error } = await supabase
        .from("notes")
        .select(
          `
          *,
          user:profiles(full_name, branch, year)
        `
        )
        .eq("id", id)
        .single();

      if (!error) {
        return data;
      }

      // If foreign key relationship error, use alternative approach
      console.log("Falling back to alternative query method for getNoteById");
      
      // Get note first
      const { data: noteData, error: noteError } = await supabase
        .from("notes")
        .select('*')
        .eq("id", id)
        .single();
        
      if (noteError) {
        console.error("Error fetching note by id:", noteError);
        return null;
      }
      
      // Then fetch user data if note exists
      if (noteData) {
        try {
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name, branch, year")
            .eq("id", noteData.user_id)
            .single();
            
          return {
            ...noteData,
            user: userData || { full_name: "Anonymous", branch: "", year: "" }
          };
        } catch (err) {
          console.log(`Could not fetch user data for note ${noteData.id}`, err);
          return {
            ...noteData,
            user: { full_name: "Anonymous", branch: "", year: "" }
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error in getNoteById:", error);
      return null;
    }
  },

  // Get notes by current user
  async getMyNotes(): Promise<Note[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user notes:", error);
      throw new Error("Failed to fetch your notes");
    }

    return data || [];
  },

  // Get notes by current user with user profile data
  async getUserNotes(): Promise<NoteWithUser[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First try the proper join approach
      const { data, error } = await supabase
        .from("notes")
        .select(
          `
          *,
          user:profiles(full_name, branch, year, gender)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        return data || [];
      }

      // If foreign key relationship error occurs, use alternative approach
      console.log("Falling back to alternative query method for getUserNotes");
      
      // Get notes first
      const { data: notesData, error: notesError } = await supabase
        .from("notes")
        .select('*')
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
        
      if (notesError) {
        console.error("Error fetching user notes:", notesError);
        throw new Error("Failed to fetch your notes");
      }
      
      // Fetch user profile once
      const { data: userProfileData } = await supabase
        .from("profiles")
        .select("full_name, branch, year, gender")
        .eq("id", user.id)
        .single();
      
      const userProfile = userProfileData || { 
        full_name: "Me", 
        branch: "", 
        year: "", 
        gender: "" 
      };
      
      // Attach the user profile to each note
      const enhancedNotes = (notesData || []).map(note => ({
        ...note,
        user: userProfile
      }));
      
      return enhancedNotes;
    } catch (error) {
      console.error("Error in getUserNotes:", error);
      throw new Error("Failed to fetch your notes");
    }
  },

  // Create a new note with file upload
  async createNoteWithFile(
    noteData: Omit<NoteCreate, "file_url" | "file_type">,
    file: File | Blob,
    fileName: string
  ): Promise<Note> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    try {
      console.log("Creating note with file, user ID:", user.id);
      
      // Ensure the user profile exists first to avoid foreign key constraint errors
      console.log("Ensuring profile exists before creating note");
      const profile = await profileService.ensureProfileExists(user.id);
      
      if (!profile) {
        throw new Error("Failed to create or verify user profile");
      }
      
      // Upload file to storage
      let uploadResult: UploadResult;
      try {
        uploadResult = await storageService.uploadNoteFile(
          file,
          fileName,
          user.id
        );
        console.log("File uploaded successfully:", uploadResult);
      } catch (uploadError) {
        console.error("File upload failed:", uploadError);
        throw new Error(`File upload failed: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`);
      }

      // Create note with file information
      try {
        const noteToInsert = {
          ...noteData,
          user_id: user.id,
          file_url: uploadResult.url,
          file_type: uploadResult.fileType,
        };
        
        console.log("Inserting note with data:", noteToInsert);
        
        const { data, error } = await supabase
          .from("notes")
          .insert([noteToInsert])
          .select()
          .single();

        if (error) {
          console.error("Error creating note in database:", error);
          // If note creation fails, delete the uploaded file
          await storageService.deleteNoteFile(uploadResult.path);
          throw new Error(`Database insert failed: ${error.message}`);
        }

        console.log("Note created successfully:", data);
        return data;
      } catch (insertError) {
        console.error("Note creation error:", insertError);
        // Clean up uploaded file if note creation fails
        await storageService.deleteNoteFile(uploadResult.path);
        throw insertError;
      }
    } catch (error) {
      console.error("Error in createNoteWithFile:", error);
      throw error;
    }
  },

  // Create a new note (without file upload)
  async createNote(noteData: NoteCreate): Promise<Note> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    try {
      // Ensure the user profile exists first
      console.log("Ensuring profile exists before creating note");
      const profile = await profileService.ensureProfileExists(user.id);
      
      if (!profile) {
        throw new Error("Failed to create or verify user profile");
      }
      
      const { data, error } = await supabase
        .from("notes")
        .insert([
          {
            ...noteData,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating note:", error);
        throw new Error("Failed to create note");
      }

      return data;
    } catch (error) {
      console.error("Error in createNote:", error);
      throw error;
    }
  },

  // Update a note
  async updateNote(id: string, updates: NoteUpdate): Promise<Note> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("notes")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id); // Ensure user owns the note

    if (error) {
      console.error("Error updating note:", error);
      throw new Error("Failed to update note");
    }

    return data;
  },

  // Update a note with new file
  async updateNoteWithFile(
    id: string,
    updates: Omit<NoteUpdate, "file_url" | "file_type">,
    file: File | Blob,
    fileName: string
  ): Promise<Note> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    try {
      // Get current note to delete old file
      const currentNote = await this.getNoteById(id);
      if (!currentNote || currentNote.user_id !== user.id) {
        throw new Error("Note not found or access denied");
      }

      // Upload new file
      const uploadResult: UploadResult = await storageService.uploadNoteFile(
        file,
        fileName,
        user.id
      );

      // Update note with new file information
      const { data, error } = await supabase
        .from("notes")
        .update({
          ...updates,
          file_url: uploadResult.url,
          file_type: uploadResult.fileType,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        // If update fails, delete the new uploaded file
        await storageService.deleteNoteFile(uploadResult.path);
        console.error("Error updating note:", error);
        throw new Error("Failed to update note");
      }

      // Delete old file if it exists
      if (currentNote.file_url) {
        try {
          const oldFilePath = currentNote.file_url
            .split("/")
            .slice(-2)
            .join("/");
          await storageService.deleteNoteFile(oldFilePath);
        } catch (deleteError) {
          console.warn("Failed to delete old file:", deleteError);
        }
      }

      return data;
    } catch (error) {
      console.error("Error in updateNoteWithFile:", error);
      throw error;
    }
  },

  // Delete a note
  async deleteNote(id: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Get note to delete associated file
    const note = await this.getNoteById(id);
    if (note && note.user_id === user.id && note.file_url) {
      try {
        const filePath = note.file_url.split("/").slice(-2).join("/");
        await storageService.deleteNoteFile(filePath);
      } catch (deleteError) {
        console.warn("Failed to delete file:", deleteError);
      }
    }

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Ensure user owns the note

    if (error) {
      console.error("Error deleting note:", error);
      throw new Error("Failed to delete note");
    }
  },

  // Download a note file
  async downloadNoteFile(noteId: string): Promise<Blob> {
    const note = await this.getNoteById(noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    // Extract file path from URL
    const filePath = note.file_url.split("/").slice(-2).join("/");

    // Download file
    const fileBlob = await storageService.downloadFile(filePath);

    // Increment download count
    await this.incrementDownloads(noteId);

    return fileBlob;
  },

  // Like a note
  async likeNote(id: string): Promise<void> {
    const { error } = await supabase
      .from("notes")
      .update({ likes: supabase.rpc("increment") })
      .eq("id", id);

    if (error) {
      console.error("Error liking note:", error);
      throw new Error("Failed to like note");
    }
  },

  // Increment download count
  async incrementDownloads(id: string): Promise<void> {
    const { error } = await supabase
      .from("notes")
      .update({ downloads: supabase.rpc("increment") })
      .eq("id", id);

    if (error) {
      console.error("Error incrementing downloads:", error);
      throw new Error("Failed to update download count");
    }
  },

  // Get trending notes (most liked/downloaded)
  async getTrendingNotes(limit: number = 10): Promise<NoteWithUser[]> {
    try {
      // First try the proper join approach with proper foreign key relationship
      const { data, error } = await supabase
        .from("notes")
        .select(
          `
          *,
          user:profiles(full_name, branch, year)
        `
        )
        .order("likes", { ascending: false })
        .order("downloads", { ascending: false })
        .limit(limit);

      if (!error) {
        return data || [];
      }

      // If the foreign key relationship error occurs, use alternative approach
      console.log("Falling back to alternative query method for trending notes");
      
      // Get notes first
      const { data: notesData, error: notesError } = await supabase
        .from("notes")
        .select('*')
        .order("likes", { ascending: false })
        .order("downloads", { ascending: false })
        .limit(limit);
        
      if (notesError) {
        console.error("Error fetching trending notes:", notesError);
        throw new Error("Failed to fetch trending notes");
      }
      
      // Then manually fetch user data for each note
      const enhancedNotes = await Promise.all((notesData || []).map(async (note) => {
        try {
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name, branch, year")
            .eq("id", note.user_id)
            .single();
            
          return {
            ...note,
            user: userData || { full_name: "Anonymous", branch: "", year: "" }
          };
        } catch (err) {
          console.log(`Could not fetch user data for note ${note.id}`, err);
          return {
            ...note,
            user: { full_name: "Anonymous", branch: "", year: "" }
          };
        }
      }));
      
      return enhancedNotes;
    } catch (error) {
      console.error("Error in getTrendingNotes:", error);
      throw new Error("Failed to fetch trending notes");
    }
  },

  // Get notes by subject
  async getNotesBySubject(subject: string): Promise<NoteWithUser[]> {
    try {
      // First try the proper join approach
      const { data, error } = await supabase
        .from("notes")
        .select(
          `
          *,
          user:profiles(full_name, branch, year)
        `
        )
        .eq("subject", subject)
        .order("created_at", { ascending: false });

      if (!error) {
        return data || [];
      }

      // If the foreign key relationship error occurs, use alternative approach
      console.log("Falling back to alternative query method for notes by subject");
      
      // Get notes first
      const { data: notesData, error: notesError } = await supabase
        .from("notes")
        .select('*')
        .eq("subject", subject)
        .order("created_at", { ascending: false });
        
      if (notesError) {
        console.error("Error fetching notes by subject:", notesError);
        throw new Error("Failed to fetch notes by subject");
      }
      
      // Then manually fetch user data for each note
      const enhancedNotes = await Promise.all((notesData || []).map(async (note) => {
        try {
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name, branch, year")
            .eq("id", note.user_id)
            .single();
            
          return {
            ...note,
            user: userData || { full_name: "Anonymous", branch: "", year: "" }
          };
        } catch (err) {
          console.log(`Could not fetch user data for note ${note.id}`, err);
          return {
            ...note,
            user: { full_name: "Anonymous", branch: "", year: "" }
          };
        }
      }));
      
      return enhancedNotes;
    } catch (error) {
      console.error("Error in getNotesBySubject:", error);
      throw new Error("Failed to fetch notes by subject");
    }
  },

  // Search notes
  async searchNotes(searchTerm: string): Promise<NoteWithUser[]> {
    try {
      // First try the proper join approach
      const { data, error } = await supabase
        .from("notes")
        .select(
          `
          *,
          user:profiles(full_name, branch, year)
        `
        )
        .or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%`
        )
        .order("created_at", { ascending: false });

      if (!error) {
        return data || [];
      }

      // If the foreign key relationship error occurs, use alternative approach
      console.log("Falling back to alternative query method for search notes");
      
      // Get notes first
      const { data: notesData, error: notesError } = await supabase
        .from("notes")
        .select('*')
        .or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%`
        )
        .order("created_at", { ascending: false });
        
      if (notesError) {
        console.error("Error searching notes:", notesError);
        throw new Error("Failed to search notes");
      }
      
      // Then manually fetch user data for each note
      const enhancedNotes = await Promise.all((notesData || []).map(async (note) => {
        try {
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name, branch, year")
            .eq("id", note.user_id)
            .single();
            
          return {
            ...note,
            user: userData || { full_name: "Anonymous", branch: "", year: "" }
          };
        } catch (err) {
          console.log(`Could not fetch user data for note ${note.id}`, err);
          return {
            ...note,
            user: { full_name: "Anonymous", branch: "", year: "" }
          };
        }
      }));
      
      return enhancedNotes;
    } catch (error) {
      console.error("Error in searchNotes:", error);
      throw new Error("Failed to search notes");
    }
  },
};
