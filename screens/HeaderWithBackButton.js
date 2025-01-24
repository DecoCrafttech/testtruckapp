import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import {  icons } from '../constants'

const HeaderWithBackButton = ({ title, onBackPress }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Image
          source={icons.home} 
          style={styles.backIcon}
        />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default HeaderWithBackButton;
