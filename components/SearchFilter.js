import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Alert, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Import clear icon
import { COLORS } from "../constants"; // Keeping your existing styles

const SearchFilter = ({ setApplyFilterPagination,handleClearFilter, searchQuery, setSearchQuery, onSearch, getAllData }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search..."
        value={searchQuery} // Controlled input
        onChangeText={onSearch}
      />

      {/* Clear Icon */}
    
        <TouchableOpacity
          style={styles.clearIcon}
          onPress={async () => {
            setApplyFilterPagination(false); // Allow `getAllLoads` to be called again
            setSearchQuery("")
            // await getAllData("", 1, 10)
            handleClearFilter()
          }}
          
        >
          <Text style={{backgroundColor:COLORS.primary,color:'#fff',padding:10,paddingHorizontal:20,borderRadius:5}}>Clear all</Text>
          {/* <MaterialIcons name="clear" size={24} color={COLORS.gray} /> */}
        </TouchableOpacity>
      
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
    top: 5,
    zIndex: 1,
  },
});

export default SearchFilter;
