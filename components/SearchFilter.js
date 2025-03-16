import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Import clear icon
import { COLORS } from "../constants"; // Keeping your existing styles

const SearchFilter = ({ searchQuery,setSearchQuery, onSearch,getAllData }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search..."
        value={searchQuery} // Controlled input
        onChangeText={onSearch}
      />

      {/* Clear Icon */}
      {searchQuery.length > 0 && (
        <TouchableOpacity
          style={styles.clearIcon}
          onPress={async () => {
            setSearchQuery("")
            await getAllData("", 1, 10)
          }}
        >
          <MaterialIcons name="clear" size={24} color={COLORS.gray} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    marginTop: 10,
    position: "relative",
  },
  input: {
    height: 50,
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10, // Add padding to prevent overlap with icon
    backgroundColor: "#fff",
  },
  clearIcon: {
    position: "absolute",
    right: 25,
    top: 12,
    zIndex: 1,
  },
});

export default SearchFilter;
