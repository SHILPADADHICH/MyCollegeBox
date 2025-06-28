export interface Note {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  subject: string;
  semester: string | null;
  branch: string | null;
  tags: string[] | null;
  file_url: string;
  file_type: "pdf" | "image";
  likes: number;
  downloads: number;
  created_at: string;
}

export interface NoteCreate {
  title: string;
  description?: string;
  subject: string;
  semester?: string;
  branch?: string;
  tags?: string[];
  file_url: string;
  file_type: "pdf" | "image";
}

export interface NoteUpdate {
  title?: string;
  description?: string;
  subject?: string;
  semester?: string;
  branch?: string;
  tags?: string[];
  file_url?: string;
  file_type?: "pdf" | "image";
}

export interface NoteWithUser extends Note {
  user: {
    full_name: string;
    branch: string | null;
    year: string | null;
    gender: string | null;
  };
}

export interface NoteFilters {
  subject?: string;
  branch?: string;
  semester?: string;
  tags?: string[];
  search?: string;
}
