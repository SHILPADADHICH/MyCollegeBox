import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Swiper from "react-native-swiper";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function Onboarding() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Swiper
        loop={false}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        paginationStyle={{ bottom: 40 }}
      >
        {/* Slide 1 */}
        <View style={styles.card}>
          <Image
            source={require("../../assets/images/campus.png")}
            style={styles.image}
          />
          <Text style={styles.title}>
            Welcome to{"\n"}
            <Text style={styles.brand}>MyCollegeBox</Text>
          </Text>
          <Text style={styles.subtitle}>
            Your all-in-one college companion.
          </Text>
        </View>

        {/* Slide 2 */}
        <View style={styles.card}>
          <Image
            source={require("../../assets/images/notes.png")}
            style={styles.image}
          />
          <Text style={styles.title}>Share Notes.{"\n"}Attend Events.</Text>
          <Text style={styles.subtitle}>
            Share notes, attend events, and connect with your college community.
          </Text>
          <TouchableOpacity style={styles.googleButton} disabled>
            <Image
              source={require("../../assets/images/google.png")}
              style={styles.googleIcon}
            />
            <Text style={styles.googleText}>
              Continue with Google (coming soon)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("./signup")}
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Slide 3 */}
        <View style={styles.card}>
          <Image
            source={require("../../assets/images/connect.png")}
            style={styles.image}
          />
          <Text style={styles.title}>Buy, Sell{"\n"}& Connect</Text>
          <Text style={styles.subtitle}>
            Connect with your college community. Find roommates, buy and sell
            books, and more.
          </Text>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => router.push("./signin")}
          >
            <Text style={styles.getStartedText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/homepage")}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        </View>
      </Swiper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    resizeMode: "contain",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    fontFamily: "Poppins_700Bold",
    color: "#1A1A2C",
    lineHeight: 36,
    marginBottom: 10,
  },
  brand: {
    color: "#303F9F",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  googleButton: {
    backgroundColor: "#FFF9C4",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    opacity: 0.7,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  googleText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#333",
  },
  actionButton: {
    backgroundColor: "#4D8DFF",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 30,
    marginTop: 10,
    marginBottom: 10,
  },
  actionButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#fff",
  },
  getStartedButton: {
    backgroundColor: "#FFD600",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 10,
  },
  getStartedText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#1A1A2C",
  },
  skip: {
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
    marginTop: 6,
    textAlign: "center",
  },
  dot: {
    backgroundColor: "#D1D5DB",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#1E3A8A",
    width: 16,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
