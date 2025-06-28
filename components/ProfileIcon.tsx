import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProfileIconProps {
  gender: "male" | "female" | "other";
  size?: number;
  color?: string;
  style?: any;
}

export const ProfileIcon: React.FC<ProfileIconProps> = ({
  gender,
  size = 100,
  color = "#4D8DFF",
  style,
}) => {
  const getIconName = () => {
    switch (gender) {
      case "male":
        return "person";
      case "female":
        return "person";
      case "other":
        return "person";
      default:
        return "person";
    }
  };

  const getBackgroundColor = () => {
    switch (gender) {
      case "male":
        return "#E3F2FD"; // Light blue background
      case "female":
        return "#FCE4EC"; // Light pink background
      case "other":
        return "#F3E5F5"; // Light purple background
      default:
        return "#F5F5F5"; // Light gray background
    }
  };

  const getIconColor = () => {
    switch (gender) {
      case "male":
        return "#2196F3"; // Blue
      case "female":
        return "#E91E63"; // Pink
      case "other":
        return "#9C27B0"; // Purple
      default:
        return "#757575"; // Gray
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getBackgroundColor(),
        },
        style,
      ]}
    >
      <Ionicons
        name={getIconName() as any}
        size={size * 0.6}
        color={getIconColor()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
