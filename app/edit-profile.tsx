import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { profileService } from "../utils/profileService";
import { Profile, ProfileUpdate } from "../types/profile";
import { ProfileIcon } from "../components/ProfileIcon";

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileUpdate>({
    name: "",
    full_name: "",
    branch: "",
    year: "",
    gender: "other",
    phone: "",
    city: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await profileService.getProfile();
      setProfile(profileData);
      if (profileData) {
        setFormData({
          name: profileData.name || "",
          full_name: profileData.full_name || "",
          branch: profileData.branch || "",
          year: profileData.year || "",
          gender: profileData.gender || "other",
          phone: profileData.phone || "",
          city: profileData.city || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setSaving(true);
    try {
      const updatedProfile = await profileService.updateProfile(formData);
      if (updatedProfile) {
        Alert.alert("Success", "Profile updated successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleGenderSelect = (gender: "male" | "female" | "other") => {
    setFormData((prev) => ({ ...prev, gender }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
        >
          <Text
            style={[
              styles.saveButtonText,
              saving && styles.saveButtonTextDisabled,
            ]}
          >
            {saving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Profile Icon Preview */}
        <View style={styles.iconPreview}>
          <ProfileIcon gender={formData.gender} size={80} />
          <Text style={styles.iconPreviewText}>Profile Icon Preview</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.full_name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, full_name: text }))
              }
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Branch</Text>
            <TextInput
              style={styles.input}
              value={formData.branch}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, branch: text }))
              }
              placeholder="e.g., Computer Science"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year</Text>
            <TextInput
              style={styles.input}
              value={formData.year}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, year: text }))
              }
              placeholder="e.g., 3rd Year"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderOptions}>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  formData.gender === "male" && styles.genderOptionSelected,
                ]}
                onPress={() => handleGenderSelect("male")}
              >
                <Ionicons
                  name="person"
                  size={24}
                  color={formData.gender === "male" ? "#2196F3" : "#666"}
                />
                <Text
                  style={[
                    styles.genderOptionText,
                    formData.gender === "male" &&
                      styles.genderOptionTextSelected,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderOption,
                  formData.gender === "female" && styles.genderOptionSelected,
                ]}
                onPress={() => handleGenderSelect("female")}
              >
                <Ionicons
                  name="person"
                  size={24}
                  color={formData.gender === "female" ? "#E91E63" : "#666"}
                />
                <Text
                  style={[
                    styles.genderOptionText,
                    formData.gender === "female" &&
                      styles.genderOptionTextSelected,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderOption,
                  formData.gender === "other" && styles.genderOptionSelected,
                ]}
                onPress={() => handleGenderSelect("other")}
              >
                <Ionicons
                  name="person"
                  size={24}
                  color={formData.gender === "other" ? "#9C27B0" : "#666"}
                />
                <Text
                  style={[
                    styles.genderOptionText,
                    formData.gender === "other" &&
                      styles.genderOptionTextSelected,
                  ]}
                >
                  Other
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, phone: text }))
              }
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, city: text }))
              }
              placeholder="Enter your city"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7FAFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  saveButton: {
    backgroundColor: "#4D8DFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#B0B0B0",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  saveButtonTextDisabled: {
    color: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  iconPreview: {
    alignItems: "center",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  iconPreviewText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  form: {
    padding: 20,
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
  genderOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: "#FFFFFF",
  },
  genderOptionSelected: {
    borderColor: "#4D8DFF",
    backgroundColor: "#F0F8FF",
  },
  genderOptionText: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
  },
  genderOptionTextSelected: {
    color: "#4D8DFF",
    fontWeight: "600",
  },
});
