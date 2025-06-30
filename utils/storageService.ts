import { supabase } from "./supabase";
import NetInfo from "@react-native-community/netinfo";

export interface UploadResult {
  url: string;
  path: string;
  fileType: "pdf" | "image";
}

// Helper function to check network connectivity
const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    console.log("Checking network connectivity...");
    const state = await NetInfo.fetch();
    console.log("Network state:", {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifi: state.type === "wifi",
      isCellular: state.type === "cellular",
    });

    // More lenient check - only fail if explicitly disconnected
    const isConnected = state.isConnected !== false;
    console.log("Network connectivity result:", isConnected);
    return isConnected;
  } catch (error) {
    console.warn("Network check failed:", error);
    console.log("Assuming network is connected due to check failure");
    return true; // Assume connected if check fails
  }
};

// Helper function to retry with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(
        `Upload attempt ${attempt} failed, retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
};

// Helper function to add timeout to promises
const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    ),
  ]);
};

export const storageService = {
  async uploadNoteFile(
    file: File | Blob | { uri: string; name?: string; type?: string },
    fileName: string,
    userId: string,
    skipNetworkCheck: boolean = false
  ): Promise<UploadResult> {
    try {
      console.log("Storage service - uploadNoteFile called");
      console.log("Parameters:", { fileName, userId, skipNetworkCheck });
      console.log("File object:", file);

      // Check network connectivity first (unless skipped for testing)
      if (!skipNetworkCheck) {
        const isConnected = await checkNetworkConnectivity();
        if (!isConnected) {
          throw new Error("No internet connection available");
        }
      } else {
        console.log("Skipping network connectivity check for testing");
      }

      // 👇 Convert URI to Blob if needed (React Native)
      let fileBlob: Blob;

      if ("uri" in file) {
        console.log("Converting URI to blob:", file.uri);
        try {
          const response = await fetch(file.uri);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch file: ${response.status} ${response.statusText}`
            );
          }
          fileBlob = await response.blob();
          console.log("Blob created successfully, size:", fileBlob.size);
        } catch (fetchError) {
          console.error("Error fetching file from URI:", fetchError);
          throw new Error(
            `File fetch failed: ${
              fetchError instanceof Error ? fetchError.message : "Unknown error"
            }`
          );
        }
      } else {
        fileBlob = file as Blob;
      }

      // Validate blob
      if (!fileBlob || fileBlob.size === 0) {
        throw new Error("Invalid file blob: empty or null");
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

      // 📤 Upload the file to Supabase with retry logic
      const uploadResult = await retryWithBackoff(async () => {
        console.log("Attempting Supabase upload...");
        console.log("Supabase client initialized:", !!supabase);

        try {
          const uploadPromise = supabase.storage
            .from("notes")
            .upload(filePath, fileBlob, {
              cacheControl: "3600",
              upsert: false,
            });

          const { data, error } = await withTimeout(uploadPromise, 30000); // 30 second timeout

          if (error) {
            console.error("Supabase upload error:", error);
            console.error("Error details:", {
              message: error.message,
              name: error.name,
            });
            throw new Error(`Upload failed: ${error.message}`);
          }

          console.log("Supabase upload successful:", data);
          return data;
        } catch (uploadError) {
          console.error("Supabase upload exception:", uploadError);
          console.error("Upload error type:", typeof uploadError);
          console.error(
            "Upload error constructor:",
            uploadError?.constructor?.name
          );

          // Check if it's a network-related error
          if (
            uploadError instanceof TypeError &&
            uploadError.message.includes("Network request failed")
          ) {
            console.error(
              "Network request failed - checking Supabase connection..."
            );
            // Try a simple Supabase operation to test connection
            try {
              const { data: testData, error: testError } =
                await supabase.auth.getUser();
              console.log("Supabase auth test result:", {
                testData,
                testError,
              });
            } catch (testError) {
              console.error("Supabase connection test failed:", testError);
            }
          }

          throw uploadError;
        }
      });

      console.log("Upload successful:", uploadResult);

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

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Network request failed")) {
          throw new Error(
            "Network connection failed. Please check your internet connection and try again."
          );
        } else if (error.message.includes("fetch")) {
          throw new Error(
            "Failed to process file. Please try selecting the file again."
          );
        } else if (error.message.includes("Upload failed")) {
          throw new Error(`Upload failed: ${error.message}`);
        }
      }

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
    const { data, error } = await supabase.storage
      .from("notes")
      .download(filePath);
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
