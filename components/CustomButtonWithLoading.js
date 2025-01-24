import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";

const CustomButtonWithLoading = ({ isLoading, onPress, disabled, buttonText, buttonStyle, indicatorSize, indicatorColor, textStyle }) => {
  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || isLoading} // Disable if loading or explicitly disabled
    >
      {isLoading ? (
        <ActivityIndicator size={indicatorSize} color={indicatorColor} />
      ) : (
        <Text style={textStyle}>{buttonText}</Text>
      )}
    </TouchableOpacity>
  );
};



const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
    width: 200,
  },
  text: {
    color: "white",
    fontSize: 16,
  },
});

export default CustomButtonWithLoading;
