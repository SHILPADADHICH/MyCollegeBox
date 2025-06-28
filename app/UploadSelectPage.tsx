import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function UploadSelectPage() {
  const handleUploadNotes = () => {
    router.push("/upload-notes");
  };

  const handleUploadRoomDetails = () => {
    router.push("/RoomDetails");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

    
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#495057" />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Upload Type</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.card} onPress={handleUploadNotes}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={48} color="#1E90FF"
 />
          </View>
          <Text style={styles.cardTitle}>Upload Notes</Text>
          <Text style={styles.cardSubtitle}>Share your study materials</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleUploadRoomDetails}>
          <View style={styles.iconContainer}>
            <Ionicons name="business" size={48} color="#1E90FF" />
          </View>
          <Text style={styles.cardTitle}>Upload Room Details</Text>
          <Text style={styles.cardSubtitle}>Share dorm information</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    fontFamily: "Poppins_600SemiBold",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 8,
    fontFamily: "Poppins_600SemiBold",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
  },
});
