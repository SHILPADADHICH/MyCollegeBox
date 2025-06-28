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

  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        console.log("PDF file picked:", file);
        // Patch: Force correct MIME type if detected as text/plain but extension is .pdf
        let fileType = file.mimeType || "application/pdf";
        if (
          (fileType === "text/plain" ||
            fileType === "text/plain;charset=UTF-8") &&
          file.name?.toLowerCase().endsWith(".pdf")
        ) {
          fileType = "application/pdf";
        }
        const fileName = file.name || `document_${Date.now()}.pdf`;
        const fileObj = {
          ...file,
          type: fileType,
          name: fileName,
          size: file.size,
          uri: file.uri,
        };
        console.log("Processed PDF file object:", fileObj);
        setSelectedFile(fileObj);
      }
    } catch (error) {
      console.error("Error picking PDF:", error);
      Alert.alert("Error", "Failed to pick PDF file");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        console.log("Image asset picked:", asset);
        // Convert to blob for upload
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        // Patch: Force correct MIME type if detected as text/plain but extension is image
        const fileExtension =
          asset.uri.split(".").pop()?.toLowerCase() || "jpg";
        let mimeType = asset.mimeType || blob.type || "";
        if (
          (mimeType === "text/plain" ||
            mimeType === "text/plain;charset=UTF-8") &&
          ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff"].includes(
            fileExtension
          )
        ) {
          mimeType = `image/${
            fileExtension === "jpg" ? "jpeg" : fileExtension
          }`;
        }
        const fileName = `image_${Date.now()}.${fileExtension}`;
        console.log("Image processing:", { fileExtension, mimeType, fileName });
        // Create a file-like object with proper type
        const file = new File([blob], fileName, {
          type: mimeType,
        });
        console.log("Processed image file object:", file);
        setSelectedFile(file);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
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

    // Validate file type with detailed logging
    console.log("Selected file for upload:", selectedFile);
    console.log("File type:", selectedFile.type);
    console.log("File mimeType:", selectedFile.mimeType);
    console.log("File name:", selectedFile.name);

    const fileType = selectedFile.type || selectedFile.mimeType;
    const fileName = selectedFile.name;

    if (!fileType) {
      console.error("No file type detected");
      Alert.alert(
        "Error",
        "Unable to determine file type. Please try selecting the file again."
      );
      return;
    }

    console.log("Detected file type:", fileType);

    // Check if file type is supported
    const isPDF = fileType === "application/pdf";
    const isImage = fileType.startsWith("image/");

    console.log("File type validation:", { isPDF, isImage, fileType });

    if (!isPDF && !isImage) {
      Alert.alert(
        "Error",
        `Unsupported file type: ${fileType}. Only PDF and image files are supported.`
      );
      return;
    }

    setLoading(true);

    try {
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
      console.log("File being uploaded:", selectedFile);

      // Create note with file upload
      const note = await notesService.createNoteWithFile(
        noteData,
        selectedFile,
        fileName
      );

      console.log("Upload successful:", note);

      Alert.alert("Success!", "Note uploaded successfully!", [
        { text: "View Note", onPress: () => router.push(`/note/${note.id}`) },
        { text: "Upload Another", onPress: () => resetForm() },
        { text: "Go Home", onPress: () => router.push("/homepage") },
      ]);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Error",
        `Failed to upload note: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#4D8DFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Notes</Text>
        <View style={{ width: 24 }} />
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
          {/* File Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select File</Text>
            <Text style={styles.sectionSubtitle}>
              Choose a PDF or image file to upload
            </Text>

            <View style={styles.fileButtons}>
              <TouchableOpacity style={styles.fileButton} onPress={pickPDF}>
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
