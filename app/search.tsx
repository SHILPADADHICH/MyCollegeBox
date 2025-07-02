import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { notesService } from "../utils/notesService";
import { NoteWithUser } from "../types/notes";
import { ProfileIcon } from "../components/ProfileIcon";

export default function SearchPage() {
  const router = useRouter();
  const { q } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((q as string) || "");
  const [searchResults, setSearchResults] = useState<NoteWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (q) {
      handleSearch(q as string);
    }
  }, [q]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const results = await notesService.searchNotes(query.trim());
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Error", "Failed to search notes");
    } finally {
      setLoading(false);
    }
  };

  const handleNotePress = (note: NoteWithUser) => {
    router.push(`/note/${note.id}` as any);
  };

  const handleDownload = async (note: NoteWithUser) => {
    try {
      await notesService.downloadNoteFile(note.id);
      Alert.alert("Success", "Note downloaded successfully!");
      // Refresh search results to update download count
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      }
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
        <Text style={styles.headerTitle}>Search Notes</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarWrapper}>
        <Ionicons name="search" size={20} color="#B0B0B0" />
        <TextInput
          style={styles.searchBar}
          placeholder="Search notes by title, subject, or tags..."
          placeholderTextColor="#B0B0B0"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
          returnKeyType="search"
        />
        {searchQuery.trim() && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#4D8DFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4D8DFF" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searched ? (
        searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderNoteCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, gap: 16 }}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#B0B0B0" />
            <Text style={styles.emptyText}>No notes found</Text>
            <Text style={styles.emptySubtext}>
              Try different keywords or check your spelling
            </Text>
          </View>
        )
      ) : (
        <View style={styles.initialContainer}>
          <Ionicons name="search-outline" size={64} color="#B0B0B0" />
          <Text style={styles.initialText}>Search for notes</Text>
          <Text style={styles.initialSubtext}>
            Enter keywords to find notes by title, subject, or tags
          </Text>
        </View>
      )}
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
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#222",
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
  initialContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  initialText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#444",
    marginTop: 16,
    textAlign: "center",
  },
  initialSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
});
