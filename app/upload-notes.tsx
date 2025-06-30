import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { notesService } from "../utils/notesService";
import NetInfo from "@react-native-community/netinfo";

export default function UploadNotesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    semester: "",
    branch: "",
    tags: "",
  });

  const pickDocument = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const document = result.assets[0];
        console.log("Document picked:", document);

        try {
          // Validate the document
          if (!document.uri) {
            throw new Error("Invalid document: Missing URI");
          }

          if (document.size === 0) {
            throw new Error("The selected PDF appears to be empty (0 bytes)");
          }

          // Check if the file is a PDF
          const fileName = document.name || `document_${Date.now()}.pdf`;
          if (!fileName.toLowerCase().endsWith(".pdf")) {
            throw new Error("The selected file is not a PDF");
          }

          // Set the document as the selected file
          // Note: In React Native, we pass the uri directly to the upload service
          // which will handle the blob conversion internally
          setSelectedFile({
            uri: document.uri,
            name: fileName,
            type: "application/pdf",
            size: document.size,
          });

          console.log("Document ready for upload:", {
            uri: document.uri,
            name: fileName,
            type: "application/pdf",
          });
        } catch (error: any) {
          console.error("Error processing document:", error);
          Alert.alert("Error", `Failed to process document: ${error.message}`);
        }
      }
    } catch (error: any) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log("Image asset picked:", asset);

        try {
          // Validate the image
          if (!asset.uri) {
            throw new Error("Invalid image: Missing URI");
          }

          if (asset.width === 0 || asset.height === 0) {
            throw new Error("The selected image appears to be invalid");
          }

          // Create a file name based on image format or default to jpg
          const uriParts = asset.uri.split(".");
          const fileExtension = uriParts[uriParts.length - 1] || "jpg";
          const fileName = `image_${Date.now()}.${fileExtension}`;

          // Set proper MIME type based on extension
          let mimeType = asset.mimeType || "image/jpeg";
          if (fileExtension === "png") mimeType = "image/png";
          if (fileExtension === "gif") mimeType = "image/gif";
          if (fileExtension === "webp") mimeType = "image/webp";

          // Set the image as the selected file
          // Note: In React Native, we pass the uri directly to the upload service
          // which will handle the blob conversion internally
          setSelectedFile({
            uri: asset.uri,
            name: fileName,
            type: mimeType,
            width: asset.width,
            height: asset.height,
            size: asset.fileSize || 0,
          });

          console.log("Image ready for upload:", {
            uri: asset.uri,
            name: fileName,
            type: mimeType,
          });
        } catch (error: any) {
          console.error("Error processing image:", error);
          Alert.alert("Error", `Failed to process image: ${error.message}`);
        }
      }
    } catch (error: any) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert("Error", "Please select a file to upload");
      return;
    }

    if (!formData.title.trim() || !formData.subject.trim()) {
      Alert.alert("Error", "Please fill in title and subject");
      return;
    }

    // Log the selected file details for debugging
    console.log("Selected file for upload:", selectedFile);

    // Validate file name and generate one if needed
    const fileName =
      selectedFile.name ||
      `file_${Date.now()}.${
        selectedFile.type === "application/pdf" ? "pdf" : "jpg"
      }`;
    console.log("File name for upload:", fileName);

    // Set file type based on the file object or extension
    let fileType = selectedFile.type || "";
    if (!fileType) {
      // Fallback to extension-based type detection
      if (fileName.toLowerCase().endsWith(".pdf")) {
        fileType = "application/pdf";
      } else if (
        [".jpg", ".jpeg", ".png", ".gif", ".webp"].some((ext) =>
          fileName.toLowerCase().endsWith(ext)
        )
      ) {
        fileType = "image/jpeg";
      } else {
        Alert.alert(
          "Error",
          "Cannot determine file type. Please select another file."
        );
        return;
      }
    }

    console.log("File type for upload:", fileType);

    // Check if file type is supported
    const isPDF = fileType === "application/pdf";
    const isImage = fileType.startsWith("image/");

    if (!isPDF && !isImage) {
      Alert.alert(
        "Error",
        `Unsupported file type: ${fileType}. Only PDF and image files are supported.`
      );
      return;
    }

    setLoading(true);

    try {
      // Check network connectivity before attempting upload
      const netState = await checkNetworkStatus();
      if (!netState.isConnected) {
        throw new Error(
          "No internet connection. Please check your network settings and try again."
        );
      }

      // Prepare note data
      const noteData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        subject: formData.subject.trim(),
        semester: formData.semester.trim(),
        branch: formData.branch.trim(),
        tags: formData.tags.trim()
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      console.log("Uploading note with data:", noteData);

      // FALLBACK MODE: For severe network issues, try direct file-only upload first
      try {
        // Create note with file upload
        const note = await notesService.createNoteWithFile(
          noteData,
          selectedFile, // This can now be either a File, Blob, or an object with uri
          fileName
        );

        console.log("Upload successful:", note);

        Alert.alert("Success!", "Note uploaded successfully!", [
          { text: "View Note", onPress: () => router.push(`/note/${note.id}`) },
          { text: "Upload Another", onPress: () => resetForm() },
          { text: "Go Home", onPress: () => router.push("/homepage") },
        ]);
      } catch (uploadError: any) {
        console.error("Main upload failed:", uploadError);

        // Show a more helpful error message in case of network issues
        if (uploadError.message.includes("Network request failed")) {
          Alert.alert(
            "Network Error",
            "There seems to be a problem with your internet connection. Make sure you're connected to the internet and try again.",
            [{ text: "Try Again", style: "default" }]
          );
        } else {
          // Handle specific error types with more user-friendly messages
          let errorMessage = "An unknown error occurred";

          if (uploadError instanceof Error) {
            const errorText = uploadError.message;

            if (
              errorText.includes("Network request timed out") ||
              errorText.includes("Network error") ||
              errorText.includes("network request failed")
            ) {
              errorMessage =
                "Network connection issue. Please check your internet connection and try again.";
            } else if (
              errorText.includes("authentication") ||
              errorText.includes("not authenticated")
            ) {
              errorMessage = "Authentication error. Please sign in again.";
            } else if (
              errorText.includes("permission") ||
              errorText.includes("access denied")
            ) {
              errorMessage = "You don't have permission to upload files.";
            } else if (
              errorText.includes("storage quota") ||
              errorText.includes("too large")
            ) {
              errorMessage = "File is too large or storage quota exceeded.";
            } else if (errorText.includes("file type")) {
              errorMessage =
                "Invalid file type. Please select a PDF or image file.";
            } else if (
              errorText.includes("not found") ||
              errorText.includes("404")
            ) {
              errorMessage =
                "Resource not found. Please check your connection and try again.";
            } else if (errorText.includes("fetch")) {
              errorMessage =
                "Failed to fetch file from device. Please try selecting a different file.";
            } else {
              // Use original error message if it's descriptive enough
              errorMessage = `Upload failed: ${errorText}`;
            }
          }

          Alert.alert("Upload Error", errorMessage, [
            { text: "Try Again", style: "default" },

            {
              text: "Cancel",
              onPress: () => setLoading(false),
              style: "cancel",
            },
          ]);
        }
      }
    } catch (error: any) {
      console.error("Upload process error:", error);

      Alert.alert(
        "Error",
        "An unexpected error occurred during the upload process. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFormData({
      title: "",
      description: "",
      subject: "",
      semester: "",
      branch: "",
      tags: "",
    });
  };

  const getFileTypeIcon = () => {
    if (!selectedFile) return "document-outline";
    const fileType = selectedFile.type || selectedFile.mimeType;
    console.log("Getting file type icon for:", fileType);
    return fileType === "application/pdf" ? "document-text" : "image";
  };

  const getFileTypeText = () => {
    if (!selectedFile) return "No file selected";
    const fileType = selectedFile.type || selectedFile.mimeType;
    console.log("Getting file type text for:", fileType);
    if (fileType === "application/pdf") return "PDF Document";
    if (fileType.startsWith("image/")) return "Image";
    return `Unknown File Type (${fileType})`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Notes</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
        >
          {/* File Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload File</Text>
            <Text style={styles.sectionSubtitle}>
              Upload a PDF or image file for the note
            </Text>

            <View style={styles.fileButtons}>
              <TouchableOpacity
                style={styles.fileButton}
                onPress={pickDocument}
              >
                <Ionicons name="document-text" size={24} color="#FF6B6B" />
                <Text style={styles.fileButtonText}>Pick PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fileButton} onPress={pickImage}>
                <Ionicons name="image" size={24} color="#4D8DFF" />
                <Text style={styles.fileButtonText}>Pick Image</Text>
              </TouchableOpacity>
            </View>

            {/* Selected File Display */}
            {selectedFile && (
              <View style={styles.selectedFile}>
                <Ionicons
                  name={getFileTypeIcon() as any}
                  size={24}
                  color="#4D8DFF"
                />
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{selectedFile.name}</Text>
                  <Text style={styles.fileType}>{getFileTypeText()}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedFile(null)}>
                  <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Note Details Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Note Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, title: text }))
                }
                placeholder="Enter note title"
                placeholderTextColor="#B0B0B0"
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                placeholder="Describe your notes..."
                placeholderTextColor="#B0B0B0"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject *</Text>
              <TextInput
                style={styles.input}
                value={formData.subject}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, subject: text }))
                }
                placeholder="e.g., Computer Science"
                placeholderTextColor="#B0B0B0"
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Semester</Text>
                <TextInput
                  style={styles.input}
                  value={formData.semester}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, semester: text }))
                  }
                  placeholder="e.g., 3rd Semester"
                  placeholderTextColor="#B0B0B0"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Branch</Text>
                <TextInput
                  style={styles.input}
                  value={formData.branch}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, branch: text }))
                  }
                  placeholder="e.g., Computer Science"
                  placeholderTextColor="#B0B0B0"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tags</Text>
              <TextInput
                style={styles.input}
                value={formData.tags}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, tags: text }))
                }
                placeholder="e.g., algorithms, programming, data-structures"
                placeholderTextColor="#B0B0B0"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
              <Text style={styles.helperText}>Separate tags with commas</Text>
            </View>
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[
              styles.uploadButton,
              loading && styles.uploadButtonDisabled,
            ]}
            onPress={handleUpload}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Upload Note</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Extra padding at bottom for keyboard */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7FAFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  fileButtons: {
    flexDirection: "row",
    gap: 12,
  },
  fileButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  fileButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  selectedFile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  fileType: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  uploadButton: {
    backgroundColor: "#4D8DFF",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  uploadButtonDisabled: {
    backgroundColor: "#B0B0B0",
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomPadding: {
    height: 100,
  },
});

// Helper function to check network status
const checkNetworkStatus = async () => {
  try {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected,
      type: state.type,
      details: state.details,
    };
  } catch (error: any) {
    console.error("Error checking network status:", error);
    return { isConnected: false, type: "unknown", details: null };
  }
};
