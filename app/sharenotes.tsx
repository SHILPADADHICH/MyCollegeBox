import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Filters
const filters = {
  branch: ["All", "CSE", "ECE", "ME", "CE"],
  semester: ["All", "1", "2", "3", "4", "5", "6", "7", "8"],
  course: ["All", "DSA", "OS", "DBMS", "CN", "AI"],
};

// Sample Notes Data
const notesData = [
  {
    id: "1",
    title: "Operating System Notes",
    subtitle: "Complete Unit 1-5 Summary",
    user: "Ankush Kumar",
    semester: "4",
    courseCode: "OS204",
    branch: "CSE",
    downloads: 152,
  },
  {
    id: "2",
    title: "DBMS Short Notes",
    subtitle: "ER Models, SQL, Normalization",
    user: "Sanya Verma",
    semester: "5",
    courseCode: "DB305",
    branch: "CSE",
    downloads: 98,
  },
  {
    id: "3",
    title: "AI Concepts",
    subtitle: "Unit-wise explanation with diagrams",
    user: "Raj Patel",
    semester: "6",
    courseCode: "AI401",
    branch: "ECE",
    downloads: 75,
  },
  {
    id: "4",
    title: "CN Full Theory",
    subtitle: "Networking basics to protocols",
    user: "Megha Rao",
    semester: "5",
    courseCode: "CN303",
    branch: "CE",
    downloads: 60,
  },
];

export default function NotesPage() {
  const [selectedFilters, setSelectedFilters] = useState({
    branch: "All",
    semester: "All",
    course: "All",
  });

  const handleFilter = (type, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const filteredNotes = notesData.filter((note) => {
    const { branch, semester, course } = selectedFilters;
    return (
      (branch === "All" || note.branch === branch) &&
      (semester === "All" || note.semester === semester) &&
      (course === "All" ||
        note.courseCode.toLowerCase().includes(course.toLowerCase()))
    );
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shared Notes</Text>
        <Ionicons name="document-text-outline" size={28} color="#4D8DFF" />
      </View>

      {/* Filters */}
      <View style={styles.filtersWrapper}>
        {Object.entries(filters).map(([type, options]) => (
          <View key={type} style={styles.filterGroup}>
            <Text style={styles.filterLabel}>{type.toUpperCase()}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.categoryPill,
                    selectedFilters[type] === option &&
                      styles.categoryPillActive,
                  ]}
                  onPress={() => handleFilter(type, option)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedFilters[type] === option &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}
      </View>

      {/* Notes List */}
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.noteSubtitle}>{item.subtitle}</Text>
              <Text style={styles.noteDetails}>
                {item.semester} Sem | {item.courseCode} | {item.branch}
              </Text>
              <Text style={styles.noteUser}>Shared by {item.user}</Text>
              <Text style={styles.noteDownloads} >
                <Ionicons name="download-outline" size={14} color="green" />{" "}
                Your notes helped {item.downloads} students
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#B0B0B0" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    paddingTop: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },
  filtersWrapper: {
    marginBottom: 12,
  },
  filterGroup: {
    marginBottom: 8,
  },
  filterLabel: {
    marginLeft: 20,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    textTransform: "capitalize",
  },
  categoryScroll: {
    paddingHorizontal: 17,
  },
  categoryPill: {
    backgroundColor: "#F0F4FA",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
    height: 38,
  },
  categoryPillActive: {
    backgroundColor: "#4D8DFF",
  },
  categoryText: {
    fontSize: 15,
    color: "#888",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  noteCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    alignItems: "center",
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  noteSubtitle: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  noteDetails: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  noteUser: {
    fontSize: 13,
    color: "#4D8DFF",
    marginTop: 4,
  },
  noteDownloads: {
    fontSize: 12,
    color: "green",
    marginTop: 6,
  },
});
