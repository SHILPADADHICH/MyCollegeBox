import React from "react";
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
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";
import { useRouter } from "expo-router"; 

const featureCards = [
  {
    title: "Share Notes",
    label: "Form",
    icon: <MaterialIcons name="upload-file" size={26} color="#FF6B6B" />,
    bg: "#FFF0F0",
    route: "/sharenotes", 
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

const trendingNotes = [
  {
    title: "Note 1",
    desc: "Note description.",
    price: null,
    image: require("../assets/images/notes.png"),
    priceColor: "#FF6B6B",
  },
  {
    title: "Note 2",
    desc: "Note description.",
    price: null,
    image: require("../assets/images/campus.png"),
    priceColor: null,
  },
];

export default function HomePage() {
  const router = useRouter(); 

  const handleCardPress = (route) => {
    router.push(route); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFF" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>MyCollegeBox</Text>
            <Text style={styles.greeting}>Hi, User 👋</Text>
          </View>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
            style={styles.profileImg}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={20} color="#B0B0B0" />
          <TextInput
            style={styles.searchBar}
            placeholder="Search notes, events, or students"
            placeholderTextColor="#B0B0B0"
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
          <View style={styles.sectionSubtextWrapper}>
            <Ionicons name="flash" size={16} color="#FF6B6B" />
            <Text style={styles.sectionSubtext}>New</Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 16, marginBottom: 90 }}>
            {trendingNotes.map((note, idx) => (
              <View key={idx} style={styles.trendingCard}>
                <Image source={note.image} style={styles.trendingImage} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.trendingTitle}>{note.title}</Text>
                  <Text style={styles.trendingDesc}>{note.desc}</Text>
                  {note.price && (
                    <Text
                      style={[styles.trendingPrice, { color: note.priceColor }]}
                    >
                      {note.price}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Nav */}
        {/* Bottom Nav */}
<View style={styles.bottomNav}>
  <View style={styles.navItemActive}>
    <Ionicons name="home" size={22} color="#4D8DFF" />
    <Text style={styles.navLabelActive}>Home</Text>
  </View>
  <TouchableOpacity style={styles.navItem} onPress={() => router.push("/explore")}>
    <Ionicons name="compass-outline" size={22} color="#B0B0B0" />
    <Text style={styles.navLabel}>Explore</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.navItem} onPress={() => router.push("/upload")}>
    <Ionicons name="add-circle-outline" size={26} color="#B0B0B0" />
    <Text style={styles.navLabel}>Upload</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.navItem} onPress={() => router.push("/messages")}>
    <Ionicons name="chatbubble-ellipses-outline" size={22} color="#B0B0B0" />
    <Text style={styles.navLabel}>Messages</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.navItem} onPress={() => router.push("/profile")}>
    <Ionicons name="person-outline" size={22} color="#B0B0B0" />
    <Text style={styles.navLabel}>Profile</Text>
  </TouchableOpacity>
</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... same as before (unchanged styling)
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
  trendingImage: {
    width: 54,
    height: 54,
    borderRadius: 12,
    resizeMode: "cover",
  },
  trendingTitle: { fontSize: 16, fontWeight: "600", color: "#222" },
  trendingDesc: { fontSize: 13, color: "#888", marginTop: 2 },
  trendingPrice: { fontSize: 13, marginTop: 2, fontWeight: "700" },
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
  navItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  navItemActive: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    borderTopWidth: 2,
    borderTopColor: "#4D8DFF",
    backgroundColor: "#F7FAFF",
  },
  navLabel: { fontSize: 12, color: "#B0B0B0", marginTop: 2 },
  navLabelActive: {
    fontSize: 12,
    color: "#4D8DFF",
    marginTop: 2,
    fontWeight: "700",
  },
});
