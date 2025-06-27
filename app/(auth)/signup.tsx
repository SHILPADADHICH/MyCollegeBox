// File: SignUp.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../utils/supabase";

const ACCOUNT_TYPES = ["User", "PG Owner"];
const GENDERS = ["Male", "Female", "Other"];
const ROOM_TYPES = ["Single", "Double", "Triple", "Dormitory"];
const STEP_ICONS = ["👤", "🏷️", "🏢"];

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("User");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [pgName, setPgName] = useState("");
  const [pgLocation, setPgLocation] = useState("");
  const [pgContact, setPgContact] = useState("");
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const router = useRouter();

  const validateStep1 = () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return false;
    }
    if (fullName.length < 2) {
      Alert.alert("Error", "Full name must be at least 2 characters long");
      return false;
    }
    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!accountType || !gender) {
      Alert.alert("Error", "Please complete all required details");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!pgName || !pgLocation || !pgContact || roomTypes.length === 0) {
      Alert.alert("Error", "Please fill in all PG Owner details");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2())
      setStep(accountType === "PG Owner" ? 3 : 4);
    else if (step === 3 && validateStep3()) setStep(4);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleRoomTypeToggle = (type: string) => {
    setRoomTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSignUp = async () => {
    if (!acceptedTerms) {
      Alert.alert("Error", "Please accept the Terms & Conditions");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { fullName },
          
        },
      });
      if (error) throw error;

      if (data.user) {
        await supabase.from("profiles").upsert([
          {
            id: data.user.id,
            full_name: fullName,
            account_type: accountType,
            gender,
            phone,
            city,
            pg_name: accountType === "PG Owner" ? pgName : null,
            pg_location: accountType === "PG Owner" ? pgLocation : null,
            pg_contact: accountType === "PG Owner" ? pgContact : null,
            room_types: accountType === "PG Owner" ? roomTypes : null,
          },
        ]);
      }

      setIsLoading(false);
      Alert.alert(
        "Success!",
        "Account created successfully!",
        [{ text: "OK", onPress: () => router.push("./signin") }]
      );
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert("Sign Up Error", err.message || "Something went wrong.");
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.title}>👤 Step 1: Basic Info</Text>
            <Text style={styles.subtitle}>Let's get to know you!</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.emoji}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#B0B0B0"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.emoji}>📧</Text>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#B0B0B0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.emoji}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#B0B0B0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.title}>🏷️ Step 2: Details</Text>
            <Text style={styles.subtitle}>Personalize your experience</Text>
            <Text style={styles.label}>🏷️ Account Type</Text>
            <View style={styles.rowButtonGroup}>
              {ACCOUNT_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setAccountType(type)}
                  style={[
                    styles.typeButton,
                    accountType === type && styles.typeButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      accountType === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>⚥ Gender</Text>
            <View style={styles.rowButtonGroup}>
              {GENDERS.map((g) => (
                <Pressable
                  key={g}
                  onPress={() => setGender(g)}
                  style={[
                    styles.typeButton,
                    gender === g && styles.typeButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      gender === g && styles.typeButtonTextActive,
                    ]}
                  >
                    {g}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#4D8DFF"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="📱 Phone Number (optional)"
                placeholderTextColor="#B0B0B0"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="location-outline"
                size={20}
                color="#4D8DFF"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="🏠 City / Area (optional)"
                placeholderTextColor="#B0B0B0"
                value={city}
                onChangeText={setCity}
              />
            </View>
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.title}>🏢 Step 3: PG/Hostel Details</Text>
            <Text style={styles.subtitle}>For PG Owners</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.emoji}>🏢</Text>
              <TextInput
                style={styles.input}
                placeholder="PG/Hostel Name"
                placeholderTextColor="#B0B0B0"
                value={pgName}
                onChangeText={setPgName}
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="location-outline"
                size={20}
                color="#4D8DFF"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="📍 Location (city, area)"
                placeholderTextColor="#B0B0B0"
                value={pgLocation}
                onChangeText={setPgLocation}
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#4D8DFF"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="📞 Contact Number"
                placeholderTextColor="#B0B0B0"
                value={pgContact}
                onChangeText={setPgContact}
                keyboardType="phone-pad"
              />
            </View>
            <Text style={styles.label}>🛏️ Room Types Available</Text>
            <View style={styles.rowButtonGroup}>
              {ROOM_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => handleRoomTypeToggle(type)}
                  style={[
                    styles.typeButton,
                    roomTypes.includes(type) && styles.typeButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      roomTypes.includes(type) && styles.typeButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.title}>✅ Almost Done!</Text>
            <Text style={styles.subtitle}>
              Please accept our Terms & Conditions to continue.
            </Text>
            <View style={styles.termsContainer}>
              <Pressable
                style={styles.checkbox}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                {acceptedTerms ? (
                  <Ionicons name="checkmark-circle" size={24} color="#4D8DFF" />
                ) : (
                  <Ionicons name="ellipse-outline" size={24} color="#B0B0B0" />
                )}
              </Pressable>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms & Conditions</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.signUpButton,
                isLoading && styles.signUpButtonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.signUpButtonText}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepIndicator}>
            {[1, 2, accountType === "PG Owner" ? 3 : null]
              .filter(Boolean)
              .map((s, idx) => (
                <View key={s} style={styles.stepIconWrap}>
                  <Text
                    style={[
                      styles.stepIcon,
                      step === s && styles.stepIconActive,
                    ]}
                  >
                    {STEP_ICONS[idx]}
                  </Text>
                  <View
                    style={[styles.stepDot, step === s && styles.stepDotActive]}
                  />
                </View>
              ))}
          </View>
          <View style={styles.formBox}>{renderStepContent()}</View>
          <View style={styles.navButtons}>
            {step > 1 && step < 4 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            {step < 4 && (
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("./signin")}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7FAFF",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  formBox: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#4D8DFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 320,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    marginTop: 16,
    alignItems: "center",
    gap: 8,
  },
  stepIconWrap: {
    alignItems: "center",
    marginHorizontal: 6,
  },
  stepIcon: {
    fontSize: 22,
    marginBottom: 2,
    opacity: 0.5,
  },
  stepIconActive: {
    opacity: 1,
    fontSize: 26,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
    marginTop: 2,
  },
  stepDotActive: {
    backgroundColor: "#4D8DFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#444",
    fontFamily: "Poppins_600SemiBold",
    marginTop: 10,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#222",
    fontFamily: "Poppins_400Regular",
  },
  emoji: {
    fontSize: 20,
    marginRight: 6,
  },
  icon: {
    marginRight: 6,
  },
  rowButtonGroup: {
    flexDirection: "row",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    backgroundColor: "#F7FAFF",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minWidth: 80,
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#4D8DFF",
    borderColor: "#4D8DFF",
  },
  typeButtonText: {
    color: "#444",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    fontFamily: "Poppins_400Regular",
  },
  termsLink: {
    color: "#4D8DFF",
    fontFamily: "Poppins_600SemiBold",
  },
  signUpButton: {
    backgroundColor: "#4D8DFF",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#4D8DFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  signUpButtonDisabled: {
    backgroundColor: "#B0B0B0",
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 0,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "#E0E0E0",
    marginRight: 8,
  },
  backButtonText: {
    color: "#444",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },
  nextButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "#4D8DFF",
  },
  nextButtonText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  footerLink: {
    color: "#4D8DFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
});
