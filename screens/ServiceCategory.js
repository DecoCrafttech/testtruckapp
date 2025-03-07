import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Modal } from 'react-native';
import { icons, COLORS } from "../constants";
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { AntDesign } from '@expo/vector-icons';

export default function ServiceCategory() {
  const navigation = useNavigation();

  // CDN link
  const cdnLink = Constants.expoConfig?.extra?.REACT_APP_CDN_LINK;

  const [addPostModal, setAddPostModal] = useState(false);

  const postOptions = [
    { label: "Truck Post", type: "truck" },
    { label: "Load Post", type: "load" },
    { label: "Driver Post", type: "driver" },
    { label: "Buy and Sell", type: "buy_sell" },
    { label: "Petrol Bunk", type: "petrol" },
  ];

  const images = [
    { id: '1', uri: `${cdnLink}/load (1).png`, screen: "AvailableLoads" },
    { id: '2', uri: `${cdnLink}/truck.png`, screen: "AvailableTrucks" },
    { id: '3', uri: `${cdnLink}/driver.png`, screen: "AvailableDrivers" },
    { id: '4', uri: `${cdnLink}/buy&sell.png`, screen: "MarketPlace" },
  ];

  const data = [
    { id: 1, title: "Find Loads", image: { source: icons.load }, screen: "AvailableLoads" },
    { id: 2, title: "Book a Truck", image: { source: icons.truck }, screen: "AvailableTrucks" },
    { id: 10, title: "Prime Petrol Bunks", image: { source: icons.petrolBunk }, screen: "PetrolBunk" },
    { id: 8, title: "Fastag Recharge", image: { source: icons.fastag }, screen: "Fastag" },
    { id: 9, title: "Insurance Renewal", image: { source: icons.insurance }, screen: "Insurance" },
    { id: 3, title: "Driver Needs", image: { source: icons.driver }, screen: "AvailableDrivers" },
    { id: 4, title: "Truck Buy & Sell", image: { source: icons.buy }, screen: "MarketPlace" },
    { id: 5, title: "Trip Accounts Book", image: { source: icons.vaughan }, screen: "VaughanInfo" },
    { id: 6, title: "Toll Calculator", image: { source: icons.toll }, screen: "TollCalculator" },
    { id: 7, title: "Mileage Calculator", image: { source: icons.mileage }, screen: "MileageCalculator" },
  ];

  const [options, setOptions] = useState(data);

  const handlePress = (screen) => {
    navigation.navigate(screen);
  };


  const handlePostType = (type) => {
    switch (type) {
      case "truck":
        navigation.navigate("TruckNeeds");
        break;
      case "load":
        navigation.navigate("LoadNeeds");
        break;
      case "driver":
        navigation.navigate("DriverNeeds");
        break;
      case "buy_sell":
        navigation.navigate("SellYourTruck");
        break;
      case "petrol":
        navigation.navigate("PetrolBunkAdd");
        break;
      default:
        break;
    }
    setAddPostModal(false);
  };

  return (
    <>
      <View style={styles.container}>
        {/* Image Carousel */}
        <View style={{ marginBottom: 20 }}>
          <FlatList
            data={images}
            horizontal
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handlePress(item.screen)}>
                <Image source={{ uri: item.uri }} style={styles.image} />
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Add Post Button */}
        <View>
          <TouchableOpacity style={styles.addPostButton} onPress={() => setAddPostModal(true)}>
            <Text style={styles.addPostText}>+ Add Post</Text>
          </TouchableOpacity>
        </View>

        {/* Services Grid */}
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

      {/* Add Post Modal */}
      <Modal animationType="slide" transparent={true} visible={addPostModal} onRequestClose={() => setAddPostModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Add Post</Text>
              <AntDesign onPress={() => setAddPostModal(false)} name="close" size={25} color="black" />
            </View>

            {/* Post Options as Cards */}
            <FlatList
              data={postOptions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.postCard} onPress={() => handlePostType(item.type)}>
                  <Text style={styles.postCardText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
    backgroundColor: '#F1F2FF',
    paddingBottom: 70,
  },
  image: {
    width: 350,
    height: 150,
    marginRight: 10,
    borderRadius: 8,
  },
  addPostButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 15,
  },
  addPostText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: '#F6F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    padding: 15,
    borderRadius: 10,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    width: "80%",
    borderRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  postCard: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: "center",
  },
  postCardText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

