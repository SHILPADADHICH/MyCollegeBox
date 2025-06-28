import { supabase } from "./supabase";

export interface UploadResult {
  url: string;
  path: string;
  fileType: "pdf" | "image";
}

export const storageService = {
  async uploadNoteFile(
    file: File | Blob | { uri: string; name?: string; type?: string },
    fileName: string,
    userId: string
  ): Promise<UploadResult> {
    try {
      console.log("Storage service - uploadNoteFile called");
      console.log("Parameters:", { fileName, userId });
      console.log("File object:", file);

      // 👇 Convert URI to Blob if needed (React Native)
      let fileBlob: Blob;

      if ("uri" in file) {
        const response = await fetch(file.uri);
        fileBlob = await response.blob();
      } else {
        fileBlob = file as Blob;
      }

      // 🧠 Determine file type
      let fileType: "pdf" | "image";
      try {
        fileType = this.getFileType(fileBlob);
        console.log("File type determined:", fileType);
      } catch (error) {
        console.error("File type detection error:", error);
        throw new Error(
          `File type error: ${
            error instanceof Error ? error.message : "Unknown file type"
          }`
        );
      }

      // Create a unique file path
      const filePath = `${userId}/${Date.now()}_${fileName}`;
      console.log("Uploading to path:", filePath);

      // 📤 Upload the file to Supabase
      const { data, error } = await supabase.storage
        .from("notes")
        .upload(filePath, fileBlob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // 🔗 Get public URL
      const { data: urlData } = supabase.storage
        .from("notes")
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
        fileType,
      };
    } catch (error) {
      console.error("UploadNoteFile error:", error);
      throw error;
    }
  },

  // 🔍 File type detection remains the same
  getFileType(file: File | Blob): "pdf" | "image" {
    const mimeType = file.type.toLowerCase();

    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.startsWith("image/")) return "image";

    throw new Error(`Unsupported file type: ${mimeType}`);
  },

  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage.from("notes").getPublicUrl(filePath);
    return data.publicUrl;
  },

  async deleteNoteFile(filePath: string): Promise<void> {
    const { error } = await supabase.storage.from("notes").remove([filePath]);
    if (error) throw new Error(`Delete failed: ${error.message}`);
  },

  async downloadFile(filePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage.from("notes").download(filePath);
    if (error) throw new Error(`Download failed: ${error.message}`);
    return data;
  },

  async listUserFiles(userId: string): Promise<string[]> {
    const { data, error } = await supabase.storage.from("notes").list(userId);
    if (error) throw new Error(`List failed: ${error.message}`);
    return data?.map((file) => file.name) || [];
  },

  async getFileInfo(filePath: string) {
    const folder = filePath.split("/").slice(0, -1).join("/");
    const { data, error } = await supabase.storage.from("notes").list(folder);
    if (error) throw new Error(`File info failed: ${error.message}`);

    const fileName = filePath.split("/").pop();
    return data?.find((file) => file.name === fileName);
  },
};
