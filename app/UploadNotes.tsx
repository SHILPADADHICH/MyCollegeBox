import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

const pastelBg = "#f7fafc";
const cardBg = "#fff";
const yellow = "#FFD600";

const subjects = [
  "Operating Systems",
  "Mathematics",
  "Physics",
  "Chemistry",
  "English",
];

export default function UploadNotes() {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [title, setTitle] = useState("");
  const [semester, setSemester] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<any[]>([]);

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      multiple: true,
    });
    if (!result.canceled && result.assets) {
      setFiles([...files, ...result.assets]);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets) {
      setFiles([...files, ...result.assets]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <View style={{ flex: 1, backgroundColor: pastelBg }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* App Title */}
        <Text style={styles.appTitle}>MyCollegeBox</Text>
        {/* Heading */}
        <Text style={styles.heading}>Upload Notes</Text>
        <Text style={styles.subheading}>Operating Systems Unit 3</Text>

        {/* Subject Dropdown */}
        <View style={styles.cardSection}>
          <Text style={styles.label}>Subject/Course</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText}>{selectedSubject}</Text>
            <Feather
              name={showSubjectDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
          {showSubjectDropdown && (
            <View style={styles.dropdownList}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedSubject(subject);
                    setShowSubjectDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{subject}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* File Upload Section */}
        <View style={styles.cardSection}>
          <Text style={styles.label}>Upload Files</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity style={styles.uploadBtn} onPress={handlePickFile}>
              <Ionicons name="document-attach" size={24} color="#1E90FF" />
              <Text style={styles.uploadBtnText}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={handlePickImage}
            >
              <Ionicons name="image" size={24} color="#1E90FF" />
              <Text style={styles.uploadBtnText}>Image</Text>
            </TouchableOpacity>
          </View>
          {/* Thumbnails */}
          <View style={styles.fileThumbsRow}>
            {files.map((file, idx) => (
              <View key={idx} style={styles.fileThumbCard}>
                {file.mimeType?.includes("image") ? (
                  <Image source={{ uri: file.uri }} style={styles.thumbImg} />
                ) : (
                  <MaterialIcons
                    name="picture-as-pdf"
                    size={32}
                    color="#E57373"
                  />
                )}
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveFile(idx)}
                >
                  <Feather name="x" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Title & Semester */}
        <View style={styles.cardSection}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. OS Unit 3 Notes"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#bbb"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Semester</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5"
                value={semester}
                onChangeText={setSemester}
                placeholderTextColor="#bbb"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.cardSection}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { minHeight: 64, textAlignVertical: "top" }]}
            placeholder="Add a short description..."
            value={description}
            onChangeText={setDescription}
            multiline
            placeholderTextColor="#bbb"
          />
        </View>
      </ScrollView>
      {/* Submit Button */}
      <View style={styles.submitBar}>
        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    alignSelf: "center",
    marginBottom: 12,
    fontFamily: "Poppins_700Bold",
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 2,
    fontFamily: "Poppins_700Bold",
  },
  subheading: {
    fontSize: 15,
    color: "#888",
    marginBottom: 18,
    fontFamily: "Poppins_400Regular",
  },
  cardSection: {
    backgroundColor: cardBg,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
    fontFamily: "Poppins_600SemiBold",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f6fa",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dropdownText: {
    fontSize: 15,
    color: "#333",
    fontFamily: "Poppins_400Regular",
  },
  dropdownList: {
    backgroundColor: "#f3f6fa",
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f6fa",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 6,
  },
  uploadBtnText: {
    fontSize: 15,
    color: "#1E90FF",
    fontFamily: "Poppins_600SemiBold",
  },
  fileThumbsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    flexWrap: "wrap",
  },
  fileThumbCard: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#f3f6fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 8,
    position: "relative",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  thumbImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeBtn: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#E57373",
    borderRadius: 10,
    padding: 2,
    zIndex: 2,
  },
  input: {
    backgroundColor: "#f3f6fa",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 15,
    color: "#222",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontFamily: "Poppins_400Regular",
    marginBottom: 0,
  },
  submitBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    padding: 20,
    paddingBottom: 28,
  },
  submitBtn: {
    backgroundColor: yellow,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#FFD600",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  submitBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    fontFamily: "Poppins_700Bold",
  },
});
