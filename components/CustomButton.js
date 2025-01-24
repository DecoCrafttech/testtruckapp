import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants";

const CustomButton = ({ title, onPress, backgroundColor, textColor, borderColor }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: backgroundColor || COLORS.primary, borderColor: borderColor || backgroundColor }
      ]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, { color: textColor || COLORS.white }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: "center",
    marginHorizontal:5
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CustomButton;
