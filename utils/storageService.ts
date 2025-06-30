import { supabase } from "./supabase";
import axios from 'axios';
import { enhancedFetch, uploadFileWithFormData } from "./networkClient";

export interface UploadResult {
  url: string;
  path: string;
  fileType: "pdf" | "image";
}

// NOTE: For React Native, supabase storage requires XMLHttpRequest
// Ensure this is polyfilled correctly for all platforms
// Modern React Native should handle this automatically
if (typeof XMLHttpRequest === 'undefined' && typeof global !== 'undefined') {
  console.log("XMLHttpRequest not found - attempting to polyfill...");
  try {
    const { XMLHttpRequest: RNXMLHttpRequest } = require('react-native');
    if (RNXMLHttpRequest) {
      console.log("Using React Native XMLHttpRequest polyfill");
      // @ts-ignore
      global.XMLHttpRequest = RNXMLHttpRequest;
    }
  } catch (err) {
    console.error("Failed to polyfill XMLHttpRequest:", err);
  }
}

// Add a timeout wrapper function for fetch operations
const fetchWithTimeout = async (
  resource: RequestInfo,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> => {
  const { timeout = 30000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Define the bucket name as a constant to avoid errors
const BUCKET_NAME = "notes";

// Helper to create a readable file name 
const sanitizeFileName = (name: string): string => {
  // Replace spaces and special characters with underscores
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '_')
    .replace(/__+/g, '_');
  
  return `${Date.now()}_${sanitized}`;
};

export const storageService = {
  async uploadNoteFile(
    file: File | Blob | { uri: string; name?: string; type?: string },
    fileName: string,
    userId: string
  ): Promise<UploadResult> {
    try {
      console.log("Storage service - uploadNoteFile called");
      console.log("Parameters:", { fileName, userId });
      console.log("File object type:", typeof file);

      // Special handling for React Native file objects
      if ('uri' in file) {
        console.log("React Native file object with URI detected");
        return this.uploadNativeFile(file, fileName, userId);
      } else {
        console.log("Standard File/Blob object detected");
        return this.uploadBrowserFile(file as File | Blob, fileName, userId);
      }
    } catch (error) {
      console.error("UploadNoteFile error:", error);
      throw error;
    }
  },

  // Optimized upload for React Native files (with URI)
  async uploadNativeFile(
    file: { uri: string; name?: string; type?: string },
    fileName: string, 
    userId: string
  ): Promise<UploadResult> {
    try {
      console.log("Uploading from React Native URI:", file.uri);

      // Determine file type from the file info or name
      let fileType: "pdf" | "image";
      
      if (file.type === "application/pdf" || fileName.toLowerCase().endsWith('.pdf')) {
        fileType = "pdf";
      } else if (file.type?.startsWith("image/") || 
                 ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => fileName.toLowerCase().endsWith(ext))) {
        fileType = "image";
      } else {
        throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
      }
      
      console.log("File type determined:", fileType);
      
      // Create a unique file path using the sanitized name
      const filePath = `${userId}/${sanitizeFileName(fileName)}`;
      console.log("Uploading to path:", filePath);
      
      // Get the current auth session to ensure we have a fresh token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session. Please login again.");
      }
      
      // Use session access token for authentication
      const accessToken = sessionData.session.access_token;
      console.log("Got fresh access token for upload");
      
      // Attempt multiple upload methods in sequence
      try {
        console.log("⭐️ Starting upload with multiple fallback methods");
        
        // First try direct Supabase SDK upload (most reliable)
        try {
          console.log("ATTEMPT 1: Using direct Supabase SDK upload");
          
          // First convert URI to blob
          console.log("Fetching file from URI for direct upload");
          const fetchResponse = await fetch(file.uri);
          if (!fetchResponse.ok) {
            throw new Error(`Failed to fetch file from URI: ${fetchResponse.status}`);
          }
          
          const blob = await fetchResponse.blob();
          console.log(`File blob prepared: ${blob.size} bytes, type: ${blob.type}`);
          
          if (blob.size === 0) {
            throw new Error("File appears to be empty (0 bytes)");
          }
          
          // Upload using SDK
          const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, blob, {
              contentType: fileType === "pdf" ? "application/pdf" : blob.type,
              upsert: true
            });
            
          if (error) {
            console.error("Supabase direct upload error:", error);
            throw new Error(`Supabase upload error: ${error.message}`);
          }
          
          console.log("Supabase SDK upload successful!");
          const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);
            
          return {
            url: urlData.publicUrl,
            path: filePath,
            fileType
          };
        }
        catch (sdkError) {
          console.error("Supabase SDK upload failed:", sdkError);
          
          // Try REST API with service role key (avoid using anon key)
          try {
            console.log("ATTEMPT 2: Using axios with FormData and service role auth");
            const formData = new FormData();
            
            // Create file object for FormData
            const fileObject = {
              uri: file.uri,
              name: fileName,
              type: fileType === 'pdf' ? 'application/pdf' : 'image/jpeg'
            };
            
            // @ts-ignore - React Native FormData typing differs
            formData.append('file', fileObject);
            
            // Create upload URL with proper auth header
            const uploadUrl = `${supabase.supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${filePath}`;
            console.log("Uploading to:", uploadUrl);
            
            // Use session token for authorization
            const response = await axios({
              url: uploadUrl,
              method: 'POST', // Using POST instead of PUT for FormData
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${accessToken}`
              },
              data: formData,
              timeout: 30000,
              maxContentLength: Infinity,
              maxBodyLength: Infinity
            });
            
            if (response.status >= 200 && response.status < 300) {
              console.log("Axios upload successful!");
              const { data: urlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);
                
              return {
                url: urlData.publicUrl,
                path: filePath,
                fileType
              };
            }
            
            throw new Error(`Axios upload failed with status: ${response.status}`);
          }
          catch (axiosError) {
            console.error("Axios upload failed:", axiosError);
            
            // Last attempt: Try a raw fetch call with presigned URL
            console.log("ATTEMPT 3: Get presigned URL and upload directly");
            
            try {
              // Get a presigned URL for upload (doesn't require auth header for the actual upload)
              const { data: presignedData, error: presignedError } = await supabase.storage
                .from(BUCKET_NAME)
                .createSignedUploadUrl(filePath);
                
              if (presignedError || !presignedData) {
                throw new Error(`Failed to create presigned URL: ${presignedError?.message}`);
              }
              
              console.log("Got presigned URL for direct upload");
              
              // Fetch the file data
              const fileResponse = await fetch(file.uri);
              if (!fileResponse.ok) {
                throw new Error(`Failed to fetch file: ${fileResponse.status}`);
              }
              
              const fileBlob = await fileResponse.blob();
              
              // Upload using the presigned URL
              const uploadResponse = await fetch(presignedData.signedUrl, {
                method: 'PUT',
                headers: {
                  'Content-Type': fileType === 'pdf' ? 'application/pdf' : 'image/jpeg'
                },
                body: fileBlob
              });
              
              if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text().catch(() => 'Unknown error');
                throw new Error(`Presigned upload failed: ${uploadResponse.status} - ${errorText}`);
              }
              
              console.log("Presigned URL upload successful!");
              const { data: urlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);
                
              return {
                url: urlData.publicUrl,
                path: filePath,
                fileType
              };
            }
            catch (presignedError) {
              console.error("Presigned URL upload failed:", presignedError);
              throw new Error("All upload attempts failed");
            }
          }
        }
      }
      catch (allMethodsError) {
        console.error("All upload methods failed:", allMethodsError);
        throw new Error("All upload methods failed. Please try again or use another file.");
      }
    }
    catch (error) {
      console.error("uploadNativeFile error:", error);
      throw error;
    }
  },
  
  // Original upload method for browser files (File/Blob)
  async uploadBrowserFile(
    file: File | Blob,
    fileName: string,
    userId: string
  ): Promise<UploadResult> {
    try {
      console.log("Uploading from browser File/Blob");
      console.log("File object properties:", { type: (file as any).type, size: file.size });
      
      // Safety check for empty blobs
      if (file.size === 0) {
        console.error("Warning: File/Blob size is 0 bytes");
        throw new Error("File appears to be empty (0 bytes)");
      }

      // Determine file type
      let fileType: "pdf" | "image";
      try {
        fileType = this.getFileType(file);
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
      const filePath = `${userId}/${sanitizeFileName(fileName)}`;
      console.log("Uploading to path:", filePath);

      // Upload the file to Supabase with retry logic
      const maxRetries = 2;
      let attempt = 0;
      let lastError = null;

      while (attempt <= maxRetries) {
        try {
          console.log(`Upload attempt ${attempt + 1}/${maxRetries + 1} starting...`);
          const { data, error } = await supabase.storage
            .from("notes")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: attempt > 0, // On retry attempts, use upsert
            });

          if (error) {
            console.error(`Upload error (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
            lastError = error;
            attempt++;
            
            if (attempt <= maxRetries) {
              // Wait before retrying (exponential backoff)
              const backoffTime = 1000 * Math.pow(2, attempt);
              console.log(`Retrying in ${backoffTime}ms...`);
              await new Promise(resolve => setTimeout(resolve, backoffTime));
              continue;
            }
            
            throw new Error(`Upload failed: ${error.message}`);
          }
          
          // If we get here, the upload was successful
          console.log("Upload successful on attempt", attempt + 1);
          
          // 🔗 Get public URL
          const { data: urlData } = supabase.storage
            .from("notes")
            .getPublicUrl(filePath);

          console.log("Generated public URL:", urlData.publicUrl);
          
          return {
            url: urlData.publicUrl,
            path: filePath,
            fileType,
          };
        } catch (error) {
          console.error(`Upload attempt ${attempt + 1}/${maxRetries + 1} failed:`, error);
          lastError = error;
          attempt++;
          
          if (attempt <= maxRetries) {
            // Wait before retrying
            const backoffTime = 1000 * Math.pow(2, attempt);
            console.log(`Retrying in ${backoffTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            continue;
          }
          
          throw error;
        }
      }

      // If we get here, all attempts failed
      throw lastError || new Error('Upload failed after multiple attempts');
    } catch (error) {
      console.error("Browser file upload error:", error);
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

  // Direct test upload for diagnostics
  async testDirectUpload(content: string = "Test content", userId: string): Promise<{success: boolean, message: string, data?: any}> {
    try {
      console.log("TEST: Creating test blob");
      const blob = new Blob([content], { type: "text/plain" });
      const fileName = `test_${Date.now()}.txt`;
      const filePath = `${userId}/test/${fileName}`;
      
      console.log("TEST: Uploading test file to path:", filePath);
      
      const { data, error } = await supabase.storage
        .from("notes")
        .upload(filePath, blob, {
          cacheControl: "3600",
          upsert: false,
        });
        
      if (error) {
        console.error("TEST: Upload error:", error);
        return { 
          success: false, 
          message: `Upload error: ${error.message}`,
          data: error 
        };
      }
      
      console.log("TEST: Upload success:", data);
      const { data: urlData } = supabase.storage
        .from("notes")
        .getPublicUrl(filePath);
        
      return {
        success: true,
        message: "Test file uploaded successfully",
        data: {
          path: filePath,
          url: urlData.publicUrl
        }
      };
    } catch (error) {
      console.error("TEST: Direct upload error:", error);
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: error
      };
    }
  }
};
