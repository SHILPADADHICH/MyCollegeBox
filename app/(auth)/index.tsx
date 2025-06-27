import React from "react";
import { View, StyleSheet } from "react-native";
import Onboarding from "../../components/Auth/Onboarding";

export default function AuthIndex() {
  return (
    <View style={styles.container}>
      <Onboarding />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
  },
});
