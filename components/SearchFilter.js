import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { COLORS } from "../constants";

const SearchFilter = ({ searchQuery, onSearch }) => {
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search..."
        value={searchQuery} // Controlled input
        onChangeText={onSearch}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  input: {
    height: 50,
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});

export default SearchFilter;
