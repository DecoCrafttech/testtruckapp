import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";

const SearchBox = () => {
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.container}>
      <Icon name="search" size={24} color="black" style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        placeholder="Search..."
        placeholderTextColor="#aaa"
        onChangeText={text => setSearchText(text)}
        value={searchText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',    
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    marginTop: 10,  
    borderWidth: 1, 
    borderColor: '#d3d3d3', 
  },  
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,    
  },
});

export default SearchBox;
