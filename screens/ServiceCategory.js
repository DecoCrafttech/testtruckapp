import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ScrollView } from 'react-native';
import { icons } from "../constants";
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';


export default ServiceCategory = () => {
  const navigation = useNavigation();

  // cdn link
  const cdnLink = Constants.expoConfig?.extra?.REACT_APP_CDN_LINK


  const images = [
    { id: '1', uri: `${cdnLink}/load.png`, screen: "AvailableLoads" },
    { id: '2', uri: `${cdnLink}/truck.png`, screen: "AvailableTrucks" },
    { id: '3', uri: `${cdnLink}/driver.png`, screen: "AvailableDrivers" },
    { id: '4', uri: `${cdnLink}/buy&sell.png`, screen: "MarketPlace" },

  ];

  const data = [
    { id: 1, title: "Load Available", image: { source: icons.load }, screen: "AvailableLoads" },
    { id: 2, title: "Truck Availabe", image: { source: icons.truck }, screen: "AvailableTrucks" },
    { id: 3, title: "Driver Needs", image: { source: icons.driver }, screen: "AvailableDrivers" },
    { id: 4, title: "Buy & Sell", image: { source: icons.buy }, screen: "MarketPlace" },
    { id: 5, title: "Expense Calculator", image: { source: icons.vaughan }, screen: "VaughanInfo" },
    { id: 6, title: "Toll Calculator", image: { source: icons.toll }, screen: "TollCalculator" },
    { id: 7, title: "Mileage Calculator", image: { source: icons.mileage }, screen: "MileageCalculator" },
    { id: 8, title: "Fastag", image: { source: icons.fastag }, screen: "Fastag" },
    { id: 9, title: "Insurance", image: { source: icons.insurance }, screen: "Insurance" },
    { id: 10, title: "Petrol Bunks", image: { source: icons.insurance }, screen: "PetrolBunk" },

  ];
  const [options, setOptions] = useState(data);

  const handlePress = (screen) => {
    navigation.navigate(screen);
  };


  return (

    <View style={styles.container}>
      <View style={{ marginBottom: 20 }}>
        <FlatList
          data={images}
          horizontal
          automaticallyAdjustsScrollIndicatorInsets
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePress(item.screen)}>
              <Image source={{ uri: item.uri }} style={styles.image} />
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
     
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContainer}
          data={options}
          numColumns={3}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handlePress(item.screen)}
              activeOpacity={0.7}
            >
              <Image style={styles.cardImage} source={item.image.source} />
              <Text style={styles.title}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
       
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
    backgroundColor: '#F1F2FF',
    paddingBottom:70
  },


  carouselContainer: {
    flex: 1
  },
  image: {
    width: 350,
    height: 150,
    marginRight: 10,
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#F6F8FF',
    borderColor: '#fff',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#303030',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    elevation: 5,
    width: '28%',
    height: 120,
  },
  cardImage: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0d6efd',
  },
});