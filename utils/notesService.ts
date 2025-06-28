import { supabase } from "./supabase";
import {
  Note,
  NoteCreate,
  NoteUpdate,
  NoteWithUser,
  NoteFilters,
} from "../types/notes";
import { storageService, UploadResult } from "./storageService";

export const notesService = {
  // Get all notes with optional filters
  async getNotes(filters?: NoteFilters): Promise<NoteWithUser[]> {
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

    if (error) {
      console.error("Error fetching notes:", error);
      throw new Error("Failed to fetch notes");
    }

    return data || [];
  },

  // Get a single note by ID
  async getNoteById(id: string): Promise<NoteWithUser | null> {
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

    if (error) {
      console.error("Error fetching note:", error);
      return null;
    }

    return data;
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

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

    if (error) {
      console.error("Error fetching user notes:", error);
      throw new Error("Failed to fetch your notes");
    }

    return data || [];
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
      // Upload file to storage
      const uploadResult: UploadResult = await storageService.uploadNoteFile(
        file,
        fileName,
        user.id
      );

      // Create note with file information
      const { data, error } = await supabase
        .from("notes")
        .insert([
          {
            ...noteData,
            user_id: user.id,
            file_url: uploadResult.url,
            file_type: uploadResult.fileType,
          },
        ])
        .select()
        .single();

      if (error) {
        // If note creation fails, delete the uploaded file
        await storageService.deleteNoteFile(uploadResult.path);
        console.error("Error creating note:", error);
        throw new Error("Failed to create note");
      }

      return data;
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

    if (error) {
      console.error("Error fetching trending notes:", error);
      throw new Error("Failed to fetch trending notes");
    }

    return data || [];
  },

  // Get notes by subject
  async getNotesBySubject(subject: string): Promise<NoteWithUser[]> {
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

    if (error) {
      console.error("Error fetching notes by subject:", error);
      throw new Error("Failed to fetch notes by subject");
    }

    return data || [];
  },

  // Search notes
  async searchNotes(searchTerm: string): Promise<NoteWithUser[]> {
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

    if (error) {
      console.error("Error searching notes:", error);
      throw new Error("Failed to search notes");
    }

    return data || [];
  },
};
