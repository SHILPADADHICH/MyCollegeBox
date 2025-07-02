import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { notesService } from "../utils/notesService";
import { storageService } from "../utils/storageService";

export const FileUploadExample: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Pick a PDF document
  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      console.log("Selected PDF:", file);

      // You can now use this file with the storage service
      await uploadFile(file);
    } catch (error) {
      console.error("Error picking PDF:", error);
      Alert.alert("Error", "Failed to pick PDF file");
    }
  };

  // Pick an image
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      console.log("Selected image:", asset);

      // Convert to blob for upload
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      // Create a file-like object
      const file = new File([blob], `image_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      await uploadFile(file);
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // Upload file and create note
  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Example note data
      const noteData = {
        title: "Sample Note",
        description: "This is a sample note uploaded via the app",
        subject: "Computer Science",
        semester: "3rd Semester",
        branch: "Computer Science",
        tags: ["sample", "test", "upload"],
      };

      // Create note with file upload
      const note = await notesService.createNoteWithFile(
        noteData,
        file,
        file.name
      );

      console.log("Note created successfully:", note);
      Alert.alert("Success", "File uploaded and note created successfully!");

      // Example: Get public URL
      const publicUrl = storageService.getPublicUrl(
        note.file_url.split("/").slice(-2).join("/")
      );
      console.log("Public URL:", publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload file");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Download a note file
  const downloadNote = async (noteId: string) => {
    try {
      const fileBlob = await notesService.downloadNoteFile(noteId);

      // Handle the downloaded file
      console.log("File downloaded:", fileBlob);

      // For React Native, you might want to save to device or open with a viewer
      // This depends on your specific requirements
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download file");
    }
  };

  // Delete a note and its file
  const deleteNote = async (noteId: string) => {
    try {
      await notesService.deleteNote(noteId);
      Alert.alert("Success", "Note deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Failed to delete note");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>File Upload Example</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={pickPDF}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>Pick PDF Document</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={pickImage}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>Pick Image</Text>
      </TouchableOpacity>

      {uploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color="#4D8DFF" />
          <Text style={styles.uploadingText}>Uploading file...</Text>
          <Text style={styles.progressText}>{uploadProgress}%</Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Features:</Text>
        <Text style={styles.infoText}>• Upload PDF and image files</Text>
        <Text style={styles.infoText}>• Automatic file type detection</Text>
        <Text style={styles.infoText}>• Public URL generation</Text>
        <Text style={styles.infoText}>• File deletion on note removal</Text>
        <Text style={styles.infoText}>• Download tracking</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  button: {
    backgroundColor: "#4D8DFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadingContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  uploadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  progressText: {
    marginTop: 5,
    fontSize: 14,
    color: "#4D8DFF",
    fontWeight: "600",
  },
  infoContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
});
