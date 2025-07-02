import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const pastelBg = "#f7fafc";
const cardBg = "#fff";
const yellow = "#FFD600";

const roomTypes = ["Classroom", "Seminar Hall", "Lab", "Auditorium"];

export default function RoomDetails() {
  const [roomName, setRoomName] = useState("Fimbesu ICU");
  const [showRoomTypeDropdown, setShowRoomTypeDropdown] = useState(false);
  const [roomType, setRoomType] = useState(roomTypes[0]);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [instructions, setInstructions] = useState("");
  const [images, setImages] = useState<any[]>([]);

  const insets = useSafeAreaInsets();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets) {
      setImages([...images, ...result.assets]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView >
      <ScrollView
        contentContainerStyle={{
          ...styles.scrollContent,
          paddingTop: insets.top ,
          paddingBottom: insets.bottom + 120, // so content doesn't hide behind nav bar
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* <Text style={styles.appTitle}>MyCollegeBox</Text> */}
        <Text style={styles.heading}>Room Details</Text>

        {/* Room Name */}
        <View style={styles.cardSection}>
          <Text style={styles.label}>Room Name</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons
              name="person"
              size={22}
              color="#1E90FF"
              style={{ marginRight: 4 }}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={roomName}
              onChangeText={setRoomName}
              placeholder="Enter room name"
              placeholderTextColor="#bbb"
            />
            <TouchableOpacity style={styles.iconBtn}>
              <MaterialCommunityIcons
                name="snowflake"
                size={22}
                color="#FF6F61"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather
                name="x"
                size={22}
                color="#fff"
                style={{
                  backgroundColor: "#FF6F61",
                  borderRadius: 8,
                  padding: 2,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Room Type Dropdown */}
        <View style={styles.cardSection}>
          <Text style={styles.label}>Room Type</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowRoomTypeDropdown(!showRoomTypeDropdown)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText}>{roomType}</Text>
            <Feather
              name={showRoomTypeDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
          {showRoomTypeDropdown && (
            <View style={styles.dropdownList}>
              {roomTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setRoomType(type);
                    setShowRoomTypeDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Time Slot Picker */}
        <View style={styles.cardSection}>
          <Text style={styles.label}>Time Slot</Text>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="Start"
              placeholderTextColor="#bbb"
            />
            <Text style={{ fontSize: 16, color: "#888" }}>-</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="End"
              placeholderTextColor="#bbb"
            />
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="add-circle" size={28} color="#FFD600" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Upload Section */}
        <View style={styles.cardSection}>
          <Text style={styles.label}>Upload Images</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={handlePickImage}
            >
              <Ionicons name="image" size={24} color="#1E90FF" />
              <Text style={styles.uploadBtnText}>Image</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.fileThumbsRow}>
            {images.map((img, idx) => (
              <View key={idx} style={styles.fileThumbCard}>
                <Image source={{ uri: img.uri }} style={styles.thumbImg} />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveImage(idx)}
                >
                  <Feather name="x" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.cardSection}>
          <Text style={styles.label}>Special Instructions</Text>
          <TextInput
            style={[styles.input, { minHeight: 64, textAlignVertical: "top" }]}
            placeholder="Add any special instructions..."
            value={instructions}
            onChangeText={setInstructions}
            multiline
            placeholderTextColor="#bbb"
          />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.submitBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    alignSelf: "center",
    marginBottom: 4,
    fontFamily: "Poppins_700Bold",
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 18,
    fontFamily: "Poppins_700Bold",
  },
  cardSection: {
    backgroundColor: cardBg,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
    fontFamily: "Poppins_600SemiBold",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f6fa",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dropdownText: {
    fontSize: 15,
    color: "#333",
    fontFamily: "Poppins_400Regular",
  },
  dropdownList: {
    backgroundColor: "#f3f6fa",
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    backgroundColor: "#f3f6fa",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 15,
    color: "#222",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontFamily: "Poppins_400Regular",
    marginBottom: 0,
  },
  iconBtn: {
    backgroundColor: "#f3f6fa",
    borderRadius: 8,
    padding: 6,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f6fa",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 6,
  },
  uploadBtnText: {
    fontSize: 15,
    color: "#1E90FF",
    fontFamily: "Poppins_600SemiBold",
  },
  fileThumbsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    flexWrap: "wrap",
  },
  fileThumbCard: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#f3f6fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 8,
    position: "relative",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  thumbImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeBtn: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#E57373",
    borderRadius: 10,
    padding: 2,
    zIndex: 2,
  },
  submitBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
  },
  submitBtn: {
    backgroundColor: yellow,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#FFD600",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  submitBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    fontFamily: "Poppins_700Bold",
  },
});
