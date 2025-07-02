import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../utils/supabase";
import { profileService } from "../utils/profileService";
import { notesService } from "../utils/notesService";
import { ProfileIcon } from "../components/ProfileIcon";
import { Profile } from "../types/profile";
import { NoteWithUser } from "../types/notes";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [userNotes, setUserNotes] = useState<NoteWithUser[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  useEffect(() => {
    loadProfile();
    loadUserNotes();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await profileService.getProfile();
      setProfile(profileData);

      // Get user email from auth
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email || "");
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const loadUserNotes = async () => {
    try {
      setNotesLoading(true);
      const notes = await notesService.getUserNotes();
      setUserNotes(notes);
    } catch (error) {
      console.error("Error loading user notes:", error);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Error signing out: " + error.message);
    } else {
      router.replace("/(auth)/signup");
    }
  };

  const handleEditProfile = () => {
    router.push("/edit-profile" as any);
  };

  const handleNotePress = (note: NoteWithUser) => {
    router.push(`/note/${note.id}` as any);
  };

  const handleUploadNotes = () => {
    router.push("/upload-notes" as any);
  };

  const getFileTypeIcon = (fileType: string) => {
    return fileType === "pdf" ? "document-text" : "image";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4D8DFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFF" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <ProfileIcon
            gender={profile?.gender || "other"}
            size={100}
            style={styles.profileImg}
          />
          <Text style={styles.name}>
            {profile?.full_name || profile?.name || "User"}
          </Text>
          <Text style={styles.email}>{userEmail || "user@email.com"}</Text>
          {profile?.branch && (
            <Text style={styles.details}>
              {profile.branch} • {profile.year}
            </Text>
          )}
          {profile?.account_type && (
            <Text style={styles.accountType}>{profile.account_type}</Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userNotes.length}</Text>
            <Text style={styles.statLabel}>Notes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userNotes.reduce((total, note) => total + note.downloads, 0)}
            </Text>
            <Text style={styles.statLabel}>Downloads</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userNotes.reduce((total, note) => total + note.likes, 0)}
            </Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </View>

        {/* My Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Notes</Text>
            <TouchableOpacity
              onPress={handleUploadNotes}
              style={styles.uploadButton}
            >
              <Ionicons name="add" size={20} color="#4D8DFF" />
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>

          {notesLoading ? (
            <View style={styles.notesLoadingContainer}>
              <ActivityIndicator size="small" color="#4D8DFF" />
              <Text style={styles.notesLoadingText}>Loading notes...</Text>
            </View>
          ) : userNotes.length > 0 ? (
            <View style={styles.notesContainer}>
              {userNotes.slice(0, 3).map((note) => (
                <TouchableOpacity
                  key={note.id}
                  style={styles.noteCard}
                  onPress={() => handleNotePress(note)}
                >
                  <View style={styles.noteHeader}>
                    <Ionicons
                      name={getFileTypeIcon(note.file_type) as any}
                      size={20}
                      color="#4D8DFF"
                    />
                    <Text style={styles.noteTitle} numberOfLines={1}>
                      {note.title}
                    </Text>
                  </View>
                  <Text style={styles.noteSubject}>{note.subject}</Text>
                  <View style={styles.noteStats}>
                    <View style={styles.noteStat}>
                      <Ionicons name="heart" size={12} color="#FF6B6B" />
                      <Text style={styles.noteStatText}>{note.likes}</Text>
                    </View>
                    <View style={styles.noteStat}>
                      <Ionicons name="download" size={12} color="#4D8DFF" />
                      <Text style={styles.noteStatText}>{note.downloads}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              {userNotes.length > 3 && (
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>
                    View All ({userNotes.length})
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#4D8DFF" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyNotesContainer}>
              <Ionicons
                name="document-text-outline"
                size={32}
                color="#B0B0B0"
              />
              <Text style={styles.emptyNotesText}>No notes uploaded yet</Text>
              <TouchableOpacity
                onPress={handleUploadNotes}
                style={styles.uploadFirstButton}
              >
                <Text style={styles.uploadFirstButtonText}>
                  Upload Your First Note
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <ProfileOption
            icon="person-circle-outline"
            label="Edit Profile"
            onPress={handleEditProfile}
          />
          <ProfileOption icon="key-outline" label="Change Password" />
          <ProfileOption
            icon="notifications-outline"
            label="Notification Settings"
          />
          <ProfileOption icon="moon-outline" label="Dark Mode" />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

type ProfileOptionProps = {
  icon: string;
  label: string;
  onPress?: () => void;
};

const ProfileOption = ({ icon, label, onPress }: ProfileOptionProps) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <Ionicons name={icon as any} size={22} color="#4D8DFF" />
    <Text style={styles.optionLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7FAFF",
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  profileImg: {
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
  email: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  details: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  accountType: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4D8DFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4D8DFF",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  uploadButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4D8DFF",
  },
  notesLoadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  notesLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  notesContainer: {
    gap: 12,
  },
  noteCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    flex: 1,
  },
  noteSubject: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  noteStats: {
    flexDirection: "row",
    gap: 12,
  },
  noteStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  noteStatText: {
    fontSize: 12,
    color: "#666",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4D8DFF",
  },
  emptyNotesContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyNotesText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    marginBottom: 16,
  },
  uploadFirstButton: {
    backgroundColor: "#4D8DFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadFirstButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    marginLeft: 12,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B6B",
  },
});
