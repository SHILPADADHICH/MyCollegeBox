import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function ProfilePage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFF" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
            style={styles.profileImg}
          />
          <Text style={styles.name}>Shilpi</Text>
          <Text style={styles.email}>shilpi@email.com</Text>
        </View>

        {/* My Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Content</Text>
          <ProfileOption icon="document-text-outline" label="Uploaded Notes" />
          <ProfileOption icon="book-outline" label="Books for Sale" />
          <ProfileOption icon="bookmark-outline" label="Saved Items" />
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <ProfileOption icon="person-circle-outline" label="Edit Profile" />
          <ProfileOption icon="key-outline" label="Change Password" />
          <ProfileOption icon="notifications-outline" label="Notification Settings" />
          <ProfileOption icon="moon-outline" label="Dark Mode" />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Feather name="log-out" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const ProfileOption = ({ icon, label }) => (
  <TouchableOpacity style={styles.option}>
    <Ionicons name={icon} size={22} color="#4D8DFF" />
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
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  profileImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4D8DFF",
    marginBottom: 10,
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
    marginLeft: 12,
    fontSize: 15,
    color: "#222",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    alignSelf: "center",
    backgroundColor: "#FFF0F0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  logoutText: {
    marginLeft: 8,
    color: "#FF6B6B",
    fontWeight: "600",
    fontSize: 15,
  },
});
