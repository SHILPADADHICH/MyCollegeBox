import React, { useEffect, useState } from "react";
import { Link } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../utils/supabase";
import { notesService } from "../utils/notesService";
import { ProfileIcon } from "../components/ProfileIcon";
import { NoteWithUser } from "../types/notes";

const featureCards = [
  {
    title: "Upload Notes",
    label: "Share your notes",
    icon: <MaterialIcons name="upload-file" size={26} color="#FF6B6B" />,
    bg: "#FFF0F0",
    route: "/upload-notes",
  },
  {
    title: "Buy/Sell Books",
    label: "Marketplace",
    icon: <FontAwesome5 name="book" size={24} color="#4D8DFF" />,
    bg: "#F0F6FF",
    route: "/marketplace",
  },
  {
    title: "Upcoming Events",
    label: "Calendar",
    icon: <Feather name="calendar" size={26} color="#FFB800" />,
    bg: "#FFF8E1",
    route: "/UpcomingEvents",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [trendingNotes, setTrendingNotes] = useState<NoteWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchTrendingNotes();
  }, []);

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, gender, branch, year")
          .eq("id", user.id)
          .single();

        if (data) {
          setUserProfile(data);
          setUserName(data.full_name || "User");
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchTrendingNotes = async () => {
    try {
      setLoading(true);
      const notes = await notesService.getTrendingNotes(5);
      setTrendingNotes(notes);
    } catch (error) {
      console.error("Error fetching trending notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = (route: string) => {
    router.push(route);
  };

  const handleNotePress = (note: NoteWithUser) => {
    router.push(`/note/${note.id}`);
  };

  const handleDownload = async (note: NoteWithUser) => {
    try {
      await notesService.downloadNoteFile(note.id);
      Alert.alert("Success", "Note downloaded successfully!");
      // Refresh trending notes to update download count
      fetchTrendingNotes();
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download note");
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    return fileType === "pdf" ? "document-text" : "image";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFF" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>MyCollegeBox</Text>
            <Text style={styles.greeting}>
              Hi, {userName ? userName : "User"} 👋
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <ProfileIcon
              gender={userProfile?.gender || "other"}
              size={44}
              style={styles.profileImg}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={20} color="#B0B0B0" />
          <TextInput
            style={styles.searchBar}
            placeholder="Search notes, events, or students"
            placeholderTextColor="#B0B0B0"
            onSubmitEditing={(e) => {
              if (e.nativeEvent.text.trim()) {
                router.push(
                  `/search?q=${encodeURIComponent(e.nativeEvent.text.trim())}`
                );
              }
            }}
          />
        </View>

        {/* Feature Cards */}
        <View style={styles.featureCardRow}>
          {featureCards.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleCardPress(item.route)}
              style={[styles.featureCard, { backgroundColor: item.bg }]}
            >
              {item.icon}
              <Text style={styles.featureCardText}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.featureCardLabel}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending Notes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Notes</Text>
          <TouchableOpacity
            style={styles.sectionSubtextWrapper}
            onPress={() => router.push("/explore")}
          >
            <Ionicons name="flash" size={16} color="#FF6B6B" />
            <Text style={styles.sectionSubtext}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 16, marginBottom: 90 }}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  Loading trending notes...
                </Text>
              </View>
            ) : trendingNotes.length > 0 ? (
              trendingNotes.map((note, idx) => (
                <TouchableOpacity
                  key={note.id}
                  style={styles.trendingCard}
                  onPress={() => handleNotePress(note)}
                >
                  <View style={styles.noteIconContainer}>
                    <Ionicons
                      name={getFileTypeIcon(note.file_type) as any}
                      size={24}
                      color="#4D8DFF"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.trendingTitle}>{note.title}</Text>
                    <Text style={styles.trendingDesc} numberOfLines={2}>
                      {note.description || "No description available"}
                    </Text>
                    <View style={styles.noteMeta}>
                      <Text style={styles.noteAuthor}>
                        by {note.user?.full_name || "Anonymous"}
                      </Text>
                      <View style={styles.noteStats}>
                        <Ionicons name="heart" size={14} color="#FF6B6B" />
                        <Text style={styles.statText}>{note.likes}</Text>
                        <Ionicons name="download" size={14} color="#4D8DFF" />
                        <Text style={styles.statText}>{note.downloads}</Text>
                      </View>
                    </View>
                    <View style={styles.noteTags}>
                      {note.tags &&
                        note.tags.slice(0, 2).map((tag, tagIdx) => (
                          <View key={tagIdx} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => handleDownload(note)}
                  >
                    <Ionicons
                      name="download-outline"
                      size={20}
                      color="#4D8DFF"
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color="#B0B0B0"
                />
                <Text style={styles.emptyText}>No trending notes yet</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to upload notes!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Nav */}
        <View style={styles.bottomNav}>
          <View style={styles.navItemActive}>
            <Ionicons name="home" size={22} color="#4D8DFF" />
            <Text style={styles.navLabelActive}>Home</Text>
          </View>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/explore")}
          >
            <Ionicons name="compass-outline" size={22} color="#B0B0B0" />
            <Text style={styles.navLabel}>Explore</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/UploadSelectPage")}
          >
            <Ionicons name="add-circle-outline" size={26} color="#B0B0B0" />
            <Text style={styles.navLabel}>Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/messages")}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color="#B0B0B0"
            />
            <Text style={styles.navLabel}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/profile")}
          >
            <Ionicons name="person-outline" size={22} color="#B0B0B0" />
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7FAFF" },
  container: { flex: 1, paddingTop: 24, backgroundColor: "#F7FAFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  title: { fontSize: 26, fontWeight: "700", color: "#222" },
  greeting: { fontSize: 16, color: "#444", marginTop: 2 },
  profileImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    fontSize: 15,
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingHorizontal: 12,
    color: "#222",
  },
  featureCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  featureCard: {
    flex: 1,
    height: 110,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    padding: 10,
  },
  featureCardText: {
    fontSize: 14,
    marginTop: 8,
    marginLeft: 10,
    color: "#222",
    fontWeight: "600",
  },
  featureCardLabel: {
    fontSize: 12,
    color: "#B0B0B0",
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#222" },
  sectionSubtextWrapper: { flexDirection: "row", alignItems: "center" },
  sectionSubtext: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
    marginLeft: 4,
  },
  trendingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  noteIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  trendingTitle: { fontSize: 16, fontWeight: "600", color: "#222" },
  trendingDesc: { fontSize: 13, color: "#888", marginTop: 2 },
  noteMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  noteAuthor: { fontSize: 12, color: "#888", marginRight: 8 },
  noteStats: { flexDirection: "row", alignItems: "center" },
  statText: { fontSize: 12, color: "#888", marginHorizontal: 4 },
  noteTags: {
    flexDirection: "row",
    marginTop: 4,
  },
  tag: {
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
  },
  tagText: { fontSize: 12, color: "#222", fontWeight: "600" },
  downloadButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { fontSize: 16, color: "#444", fontWeight: "600" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { fontSize: 16, color: "#444", fontWeight: "600", marginTop: 16 },
  emptySubtext: { fontSize: 14, color: "#888", marginTop: 8 },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 64,
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 64,
  },
  navItemActive: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: 64,
    borderTopWidth: 2,
    borderTopColor: "#4D8DFF",
    backgroundColor: "#F7FAFF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#000",
  },
  navLabel: { fontSize: 12, color: "#B0B0B0", marginTop: 2 },
  navLabelActive: {
    fontSize: 12,
    color: "#4D8DFF",
    marginTop: 2,
    fontWeight: "700",
  },
});
