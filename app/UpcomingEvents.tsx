import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const profileImg = {
  uri: "https://randomuser.me/api/portraits/women/44.jpg",
};

const categories = [
  "All",
  "Seminars",
  "Fests",
  "Workshops",
  "Sports",
  "Cultural",
  "Other",
];

const events = [
  {
    id: "1",
    title: "Upcoming Events",
    date: "Fri, 02.23",
    time: "13:00",
    venue: "A4",
    image: require("../assets/images/notes.png"),
    isNew: true,
  },
  {
    id: "2",
    title: "Aed Coming Events",
    date: "Sun, 02.24",
    time: "14:30",
    venue: "A4",
    image: require("../assets/images/campus.png"),
    isNew: true,
  },
  {
    id: "3",
    title: "Upcoeing Events",
    date: "Thu, 02.27",
    time: "19:00",
    venue: "J2",
    image: require("../assets/images/connect.png"),
    isNew: false,
  },
  {
    id: "4",
    title: "Uptoming Mctarl",
    date: "Sat, 02.29",
    time: "20:00",
    venue: "H4",
    image: require("../assets/images/google.png"),
    isNew: false,
  },
];

export default function UpcomingEvents() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        <Image source={profileImg} style={styles.profileImg} />
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
        style={{ marginTop: 4 }}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryPill,
              selectedCategory === cat && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Event List */}
      <FlatList
        data={events.filter(
          (e) =>
            selectedCategory === "All" || e.title.includes(selectedCategory)
        )}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 10 }}
        contentContainerStyle={{ paddingBottom: 240 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Image source={item.image} style={styles.eventImage} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                {item.isNew && <View style={styles.newDot} />}
              </View>
              <Text style={styles.eventMeta}>
                {item.date} | {item.time} | {item.venue}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#B0B0B0" />
          </View>
        )}
      />

      {/* Bottom Navigation Bar
      <View style={styles.bottomNav}>
        <View style={styles.navItemActive}>
          <Ionicons name="home" size={24} color="#4D8DFF" />
          <Text style={styles.navLabelActive}>Home</Text>
        </View>
        <View style={styles.navItem}>
          <Ionicons name="compass-outline" size={24} color="#B0B0B0" />
          <Text style={styles.navLabel}>Explore</Text>
        </View>
        <View style={styles.navItem}>
          <Ionicons name="add-circle-outline" size={28} color="#B0B0B0" />
          <Text style={styles.navLabel}>Upload</Text>
        </View>
        <View style={styles.navItem}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color="#B0B0B0"
          />
          <Text style={styles.navLabel}>Messages</Text>
        </View>
        <View style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#B0B0B0" />
          <Text style={styles.navLabel}>Profile</Text>
        </View>
      </View> */}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  headerTitle: {
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  categoryScroll: {
    paddingHorizontal: 17,
    gap: 10,
  },
  
  
  categoryPill: {
    backgroundColor: "#F0F4FA",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    height: 38,
  },
  
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12, 
    padding: 10, 
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  
  categoryPillActive: {
    backgroundColor: "#4D8DFF",
  },
  categoryText: {
    fontFamily: "Poppins",
    fontSize: 15,
    color: "#888",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  
  eventImage: {
    width: 54,
    height: 54,
    borderRadius: 12,
    resizeMode: "cover",
  },
  eventTitle: {
    fontFamily: "Poppins",
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginRight: 8,
  },
  eventMeta: {
    fontFamily: "Poppins",
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  newDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B6B",
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
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navItemActive: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    borderTopWidth: 2,
    borderTopColor: "#4D8DFF",
    backgroundColor: "#F7FAFF",
  },
  navLabel: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#B0B0B0",
    marginTop: 2,
  },
  navLabelActive: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#4D8DFF",
    marginTop: 2,
    fontWeight: "700",
  },
});
