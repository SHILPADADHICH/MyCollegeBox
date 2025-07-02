import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { notesService } from "../../utils/notesService";
import { NoteWithUser } from "../../types/notes";
import { ProfileIcon } from "../../components/ProfileIcon";

export default function NoteDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [note, setNote] = useState<NoteWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const noteData = await notesService.getNoteById(id as string);
      setNote(noteData);

      // Check if user has liked this note
      const hasLiked = await notesService.hasUserLiked(id as string);
      setLiked(hasLiked);
    } catch (error) {
      console.error("Error fetching note:", error);
      Alert.alert("Error", "Failed to load note details");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!note) return;

    setDownloading(true);
    try {
      await notesService.downloadNoteFile(note.id);
      Alert.alert("Success", "Note downloaded successfully!");
      // Refresh note data to update download count
      fetchNote();
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download note");
    } finally {
      setDownloading(false);
    }
  };

  const handleLike = async () => {
    if (!note) return;

    try {
      if (liked) {
        await notesService.unlikeNote(note.id);
        setLiked(false);
      } else {
        await notesService.likeNote(note.id);
        setLiked(true);
      }
      // Refresh note data to update like count
      fetchNote();
    } catch (error) {
      console.error("Like error:", error);
      Alert.alert("Error", "Failed to update like");
    }
  };

  const handleViewFile = async () => {
    if (!note?.file_url) return;

    try {
      await Linking.openURL(note.file_url);
    } catch (error) {
      console.error("Error opening file:", error);
      Alert.alert("Error", "Failed to open file");
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    return fileType === "pdf" ? "document-text" : "image";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7FAFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4D8DFF" />
          <Text style={styles.loadingText}>Loading note...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!note) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7FAFF" />
        <View style={styles.errorContainer}>
          <Ionicons name="document-text-outline" size={48} color="#B0B0B0" />
          <Text style={styles.errorText}>Note not found</Text>
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
        <Text style={styles.headerTitle}>Note Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Note Header */}
        <View style={styles.noteHeader}>
          <View style={styles.fileTypeContainer}>
            <Ionicons
              name={getFileTypeIcon(note.file_type) as any}
              size={32}
              color="#4D8DFF"
            />
          </View>
          <View style={styles.noteInfo}>
            <Text style={styles.noteTitle}>{note.title}</Text>
            <Text style={styles.noteSubject}>{note.subject}</Text>
          </View>
        </View>

        {/* Author Info */}
        <View style={styles.authorSection}>
          <View style={styles.authorInfo}>
            <ProfileIcon gender={note.user?.gender || "other"} size={40} />
            <View style={styles.authorDetails}>
              <Text style={styles.authorName}>
                {note.user?.full_name || "Anonymous"}
              </Text>
              <Text style={styles.authorMeta}>
                {note.user?.branch && `${note.user.branch} • `}
                {note.user?.year && `Year ${note.user.year}`}
              </Text>
            </View>
          </View>
          <Text style={styles.uploadDate}>
            Uploaded {formatDate(note.created_at)}
          </Text>
        </View>

        {/* Description */}
        {note.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{note.description}</Text>
          </View>
        )}

        {/* Note Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            {note.semester && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Semester</Text>
                <Text style={styles.detailValue}>{note.semester}</Text>
              </View>
            )}
            {note.branch && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Branch</Text>
                <Text style={styles.detailValue}>{note.branch}</Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>File Type</Text>
              <Text style={styles.detailValue}>
                {note.file_type.toUpperCase()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Downloads</Text>
              <Text style={styles.detailValue}>{note.downloads}</Text>
            </View>
          </View>
        </View>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {note.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="download" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Download</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleViewFile}
          >
            <Ionicons name="eye" size={20} color="#4D8DFF" />
            <Text style={styles.secondaryButtonText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleLike}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={20}
              color={liked ? "#FF6B6B" : "#4D8DFF"}
            />
            <Text
              style={[styles.secondaryButtonText, liked && styles.likedText]}
            >
              {note.likes}
            </Text>
          </TouchableOpacity>
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
  container: {
    flex: 1,
    padding: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  fileTypeContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  noteInfo: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },
  noteSubject: {
    fontSize: 16,
    color: "#666",
  },
  authorSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  authorDetails: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  authorMeta: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  uploadDate: {
    fontSize: 12,
    color: "#888",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  detailItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: "#222",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#4D8DFF",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  secondaryButtonText: {
    color: "#4D8DFF",
    fontSize: 16,
    fontWeight: "600",
  },
  likedText: {
    color: "#FF6B6B",
  },
});
