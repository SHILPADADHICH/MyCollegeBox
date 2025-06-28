import React, { useState } from "react";
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
} from "react-native";
import { Link } from "expo-router";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const FILTERS = [
  {
    label: "Rent",
    icon: <MaterialIcons name="attach-money" size={18} color="#4D8DFF" />,
  },
  {
    label: "Single",
    icon: <Ionicons name="person" size={16} color="#4D8DFF" />,
  },
  {
    label: "Double",
    icon: <Ionicons name="people" size={16} color="#4D8DFF" />,
  },
  {
    label: "Triple",
    icon: <Ionicons name="people-circle" size={16} color="#4D8DFF" />,
  },
  { label: "Wi-Fi", icon: <Feather name="wifi" size={16} color="#4D8DFF" /> },
  {
    label: "AC",
    icon: <MaterialIcons name="ac-unit" size={16} color="#4D8DFF" />,
  },
  {
    label: "Washing Machine",
    icon: (
      <MaterialIcons name="local-laundry-service" size={16} color="#4D8DFF" />
    ),
  },
  { label: "Male", icon: <Ionicons name="male" size={16} color="#4D8DFF" /> },
  {
    label: "Female",
    icon: <Ionicons name="female" size={16} color="#4D8DFF" />,
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
  const [activeTab, setActiveTab] = useState("List");
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);

  const toggleFilter = (label) => {
    setSelectedFilters((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Explore</Text>
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
            style={[styles.tabBtn, activeTab === "Map" && styles.tabBtnActive]}
            onPress={() => setActiveTab("Map")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Map" && styles.tabTextActive,
              ]}
            >
              Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarWrapper}>
        <Ionicons
          name="location-outline"
          size={20}
          color="#B0B0B0"
          style={{ marginLeft: 10 }}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search by location, PG, or area"
          placeholderTextColor="#B0B0B0"
          value={search}
          onChangeText={setSearch}
        />
        <Ionicons
          name="search"
          size={20}
          color="#4D8DFF"
          style={{ marginRight: 10 }}
        />
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

      {/* Room Cards or Map */}
      {activeTab === "List" ? (
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {ROOMS.map((room) => (
            <View key={room.id} style={styles.roomCard}>
              <Image source={room.image} style={styles.roomImage} />
              <View style={styles.roomInfo}>
                <Text style={styles.roomTitle}>{room.title}</Text>
                <Text style={styles.roomRent}>{room.rent}</Text>
                <View style={styles.roomMetaRow}>
                  <View style={styles.metaItem}>
                    <FontAwesome5 name="users" size={15} color="#4D8DFF" />
                    <Text style={styles.metaText}>{room.sharing}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    {GENDER_ICONS[room.gender]}
                    <Text style={styles.metaText}>{room.gender}</Text>
                  </View>
                  {room.amenities.map((am, idx) => (
                    <View key={idx} style={styles.metaItem}>
                      {am === "Wi-Fi" && (
                        <Feather name="wifi" size={15} color="#4D8DFF" />
                      )}
                      {am === "AC" && (
                        <MaterialIcons
                          name="ac-unit"
                          size={15}
                          color="#4D8DFF"
                        />
                      )}
                      {am === "Washing Machine" && (
                        <MaterialIcons
                          name="local-laundry-service"
                          size={15}
                          color="#4D8DFF"
                        />
                      )}
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={styles.contactBtn}>
                  <Ionicons name="call" size={18} color="#fff" />
                  <Text style={styles.contactBtnText}>Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={{ height: 80 }} />
        </ScrollView>
      ) : (
        <View style={styles.mapViewPlaceholder}>
          <Ionicons name="map-outline" size={64} color="#B0B0B0" />
          <Text
            style={{
              color: "#B0B0B0",
              fontSize: 16,
              marginTop: 8,
            }}
          >
            Map View Coming Soon
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
  // (same styles as your code, no changes needed)
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 48,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
  },
  tabSwitch: {
    flexDirection: "row",
    backgroundColor: "#F2F6FA",
    borderRadius: 16,
    overflow: "hidden",
  },
  tabBtn: {
    paddingVertical: 2,
    paddingHorizontal: 18,
  },
  tabBtnActive: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    color: "#B0B0B0",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#4D8DFF",
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFF",
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 8,
  },
  searchBar: {
    flex: 1,
    height: 44,
    fontSize: 15,
    borderRadius: 16,
    paddingHorizontal: 12,
    color: "#222",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F6FA",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    height: 50,
  },
  chipActive: {
    backgroundColor: "#4D8DFF",
  },
  chipText: {
    fontSize: 14,
    color: "#4D8DFF",
    marginLeft: 6,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#fff",
  },
  roomCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginTop: 20,
    marginHorizontal: 18,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    overflow: "hidden",
  },
  roomImage: {
    width: "100%",
    height: width * 0.42,
    resizeMode: "cover",
  },
  roomInfo: {
    padding: 16,
  },
  roomTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginBottom: 2,
  },
  roomRent: {
    fontSize: 15,
    color: "#4D8DFF",
    fontWeight: "600",
    marginBottom: 8,
  },
  roomMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    gap: 3,
  },
  metaText: {
    fontSize: 13,
    color: "#555",
    marginLeft: 3,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4D8DFF",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  contactBtnText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    marginLeft: 7,
  },
  mapViewPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
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
  height: 64, // ensure same height
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
  borderTopRightRadius: 18, // 👈 Add these two
  shadowColor: "#000",
// shadowOpacity: 0.04,
// shadowRadius: 4,
// shadowOffset: { width: 0, height: -1 },
// elevation: 3,
},

  navLabel: { fontSize: 12, color: "#B0B0B0", marginTop: 2 },
  navLabelActive: {
    fontSize: 12,
    color: "#4D8DFF",
    marginTop: 2,
    fontWeight: "700",
  },
});
