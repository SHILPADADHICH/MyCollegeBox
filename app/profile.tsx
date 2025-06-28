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
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../utils/supabase";
import { profileService } from "../utils/profileService";
import { ProfileIcon } from "../components/ProfileIcon";
import { Profile } from "../types/profile";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
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
