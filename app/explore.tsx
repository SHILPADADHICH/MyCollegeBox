import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";
import { notesService } from "../utils/notesService";
import { NoteWithUser } from "../types/notes";
import { ProfileIcon } from "../components/ProfileIcon";

const { width } = Dimensions.get("window");

const FILTERS = [
  {
    label: "All",
    icon: <Ionicons name="apps" size={18} color="#4D8DFF" />,
  },
  {
    label: "PDF",
    icon: <MaterialIcons name="picture-as-pdf" size={18} color="#FF6B6B" />,
  },
  {
    label: "Image",
    icon: <Ionicons name="image" size={18} color="#4D8DFF" />,
  },
  {
    label: "Computer Science",
    icon: <MaterialIcons name="computer" size={18} color="#4D8DFF" />,
  },
  {
    label: "Engineering",
    icon: <MaterialIcons name="engineering" size={18} color="#4D8DFF" />,
  },
  {
    label: "Mathematics",
    icon: <MaterialIcons name="functions" size={18} color="#4D8DFF" />,
  },
  {
    label: "Physics",
    icon: <MaterialIcons name="science" size={18} color="#4D8DFF" />,
  },
];

const ROOMS = [
  {
    id: "1",
    title: "Cozy Triple Sharing",
    rent: "₹6,000/mo",
    image: require("../assets/images/campus.png"),
    sharing: "Triple",
    gender: "Male",
    amenities: ["Wi-Fi", "AC", "Washing Machine"],
  },
  {
    id: "2",
    title: "Single Room with Balcony",
    rent: "₹10,500/mo",
    image: require("../assets/images/notes.png"),
    sharing: "Single",
    gender: "Female",
    amenities: ["Wi-Fi", "AC"],
  },
  {
    id: "3",
    title: "Double Sharing Deluxe",
    rent: "₹8,200/mo",
    image: require("../assets/images/connect.png"),
    sharing: "Double",
    gender: "Any",
    amenities: ["Wi-Fi"],
  },
];

const GENDER_ICONS = {
  Male: <Ionicons name="male" size={18} color="#4D8DFF" />,
  Female: <Ionicons name="female" size={18} color="#FF6B6B" />,
  Any: <Ionicons name="people" size={18} color="#4D8DFF" />,
};

export default function ExploreScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("List");
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState(["All"]);
  const [notes, setNotes] = useState<NoteWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      handleSearch();
    } else {
      fetchNotes();
    }
  }, [search]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const allNotes = await notesService.getNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      Alert.alert("Error", "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      setSearching(true);
      const searchResults = await notesService.searchNotes(search.trim());
      setNotes(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Error", "Failed to search notes");
    } finally {
      setSearching(false);
    }
  };

  const toggleFilter = (label: string) => {
    if (label === "All") {
      setSelectedFilters(["All"]);
    } else {
      setSelectedFilters((prev) => {
        const newFilters = prev.filter((f) => f !== "All");
        if (prev.includes(label)) {
          return newFilters.filter((f) => f !== label);
        } else {
          return [...newFilters, label];
        }
      });
    }
  };

  const getFilteredNotes = () => {
    if (selectedFilters.includes("All")) {
      return notes;
    }

    return notes.filter((note) => {
      // File type filter
      if (selectedFilters.includes("PDF") && note.file_type === "pdf") {
        return true;
      }
      if (selectedFilters.includes("Image") && note.file_type === "image") {
        return true;
      }

      // Subject filter
      if (
        selectedFilters.some(
          (filter) =>
            [
              "Computer Science",
              "Engineering",
              "Mathematics",
              "Physics",
            ].includes(filter) &&
            note.subject?.toLowerCase().includes(filter.toLowerCase())
        )
      ) {
        return true;
      }

      return false;
    });
  };

  const handleNotePress = (note: NoteWithUser) => {
    router.push(`/note/${note.id}` as any);
  };

  const handleDownload = async (note: NoteWithUser) => {
    try {
      await notesService.downloadNoteFile(note.id);
      Alert.alert("Success", "Note downloaded successfully!");
      // Refresh notes to update download count
      fetchNotes();
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download note");
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    return fileType === "pdf" ? "document-text" : "image";
  };

  const renderNoteCard = ({ item: note }: { item: NoteWithUser }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => handleNotePress(note)}
    >
      <View style={styles.noteHeader}>
        <View style={styles.fileTypeContainer}>
          <Ionicons
            name={getFileTypeIcon(note.file_type) as any}
            size={24}
            color="#4D8DFF"
          />
        </View>
        <View style={styles.noteInfo}>
          <Text style={styles.noteTitle} numberOfLines={2}>
            {note.title}
          </Text>
          <Text style={styles.noteSubject}>{note.subject}</Text>
        </View>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => handleDownload(note)}
        >
          <Ionicons name="download-outline" size={20} color="#4D8DFF" />
        </TouchableOpacity>
      </View>

      {note.description && (
        <Text style={styles.noteDescription} numberOfLines={2}>
          {note.description}
        </Text>
      )}

      <View style={styles.noteMeta}>
        <View style={styles.authorInfo}>
          <ProfileIcon gender={note.user?.gender || "other"} size={24} />
          <Text style={styles.authorName}>
            {note.user?.full_name || "Anonymous"}
          </Text>
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="heart" size={14} color="#FF6B6B" />
            <Text style={styles.statText}>{note.likes}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="download" size={14} color="#4D8DFF" />
            <Text style={styles.statText}>{note.downloads}</Text>
          </View>
        </View>
      </View>

      {note.tags && note.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {note.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {note.tags.length > 3 && (
            <Text style={styles.moreTags}>+{note.tags.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const filteredNotes = getFilteredNotes();

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Explore Notes</Text>
        <View style={styles.tabSwitch}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "List" && styles.tabBtnActive]}
            onPress={() => setActiveTab("List")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "List" && styles.tabTextActive,
              ]}
            >
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "Grid" && styles.tabBtnActive]}
            onPress={() => setActiveTab("Grid")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Grid" && styles.tabTextActive,
              ]}
            >
              Grid
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarWrapper}>
        <Ionicons
          name="search"
          size={20}
          color="#B0B0B0"
          style={{ marginLeft: 10 }}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search notes by title, subject, or tags..."
          placeholderTextColor="#B0B0B0"
          value={search}
          onChangeText={setSearch}
        />
        {(searching || (search.trim() && !searching)) && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color="#4D8DFF"
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View>
        <FlatList
          data={FILTERS}
          keyExtractor={(item) => item.label}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 10,
            paddingHorizontal: 10,
            marginVertical: 12,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                selectedFilters.includes(item.label) && styles.chipActive,
              ]}
              onPress={() => toggleFilter(item.label)}
            >
              {item.icon}
              <Text
                style={[
                  styles.chipText,
                  selectedFilters.includes(item.label) && styles.chipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Notes List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4D8DFF" />
          <Text style={styles.loadingText}>Loading notes...</Text>
        </View>
      ) : filteredNotes.length > 0 ? (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          numColumns={activeTab === "Grid" ? 2 : 1}
          key={activeTab}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color="#B0B0B0" />
          <Text style={styles.emptyText}>
            {search.trim()
              ? "No notes found for your search"
              : "No notes available"}
          </Text>
          <Text style={styles.emptySubtext}>
            {search.trim()
              ? "Try different keywords"
              : "Be the first to upload notes!"}
          </Text>
        </View>
      )}

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <Link href="/homepage" asChild>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={22} color="#B0B0B0" />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/explore" asChild>
          <TouchableOpacity style={styles.navItemActive}>
            <Ionicons name="compass-outline" size={22} color="#4D8DFF" />
            <Text style={styles.navLabelActive}>Explore</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/UploadSelectPage" asChild>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="add-circle-outline" size={26} color="#B0B0B0" />
            <Text style={styles.navLabel}>Upload</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/messages" asChild>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color="#B0B0B0"
            />
            <Text style={styles.navLabel}>Messages</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/profile" asChild>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="person-outline" size={22} color="#B0B0B0" />
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },
  tabSwitch: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
    color: "#4D8DFF",
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#222",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 6,
  },
  chipActive: {
    backgroundColor: "#4D8DFF",
    borderColor: "#4D8DFF",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  chipTextActive: {
    color: "#FFFFFF",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    marginHorizontal: 4,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  fileTypeContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  noteInfo: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 2,
  },
  noteSubject: {
    fontSize: 14,
    color: "#666",
  },
  downloadButton: {
    padding: 8,
  },
  noteDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  noteMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  stats: {
    flexDirection: "row",
    gap: 12,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#666",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: "#222",
    fontWeight: "500",
  },
  moreTags: {
    fontSize: 10,
    color: "#666",
    alignSelf: "center",
  },
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
  },
  navLabel: { fontSize: 12, color: "#B0B0B0", marginTop: 2 },
  navLabelActive: {
    fontSize: 12,
    color: "#4D8DFF",
    marginTop: 2,
    fontWeight: "700",
  },
});
