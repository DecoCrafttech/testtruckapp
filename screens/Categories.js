import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { icons } from "../constants";

const Categories = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([
    {
      text: "Fastag",
      image: {
        source: icons.fastag,
      },
      screen: "Fastag",
    },
    {
      text: "Insurance",
      image: {
        source: icons.insurance,
      },
      screen: "Insurance",
    },
    {
      text: "Toll Calculator",
      image: {
        source: icons.toll,
      },
      screen: "TollCalculator",
    },
    {
      text: "Mileage Calculator",
      image: {
        source: icons.mileage,
      },
      screen: "MileageCalculator",
    },
    
    {
      text: "Expense Calculator",
      image: {
        source: icons.vaughan,
      },
      screen: "VaughanInfo",
    },
    {
      text: "Buy & Sell",
      image: {
        source: icons.buy,
      },
      screen: "MarketPlace",
    },
    {
      text: "Load Available",
      image: {
        source: icons.load,
      },
      screen: "AvailableLoads",
    },
    {
      text: "Driver Needs",
      image: {
        source: icons.driver,
      },
      screen: "AvailableDrivers",
    },
    {
      text: "Truck Availabe",
      image: {
        source: icons.truck,
      },
      screen: "AvailableTrucks",
    },
  ]);
  return (
    <View style={{ flex: 1, backgroundColor: "#e8f4ff", marginBottom: 60 }}>
      <Text style={styles.heading}>Categories</Text>
      <FlatList
        data={categories}
        numColumns={3}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.iconContainer}>
              <Image
                source={item.image.source}
                style={{ width: 30, height: 30 }}
              />
              <Text style={styles.text}>{item.text}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 15,
    margin: 15,
    color: "#e33264",
    fontWeight: "bold",
  },
  flatListContent: {
    flexGrow: 1,
  },
  itemContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    height: 120,
  },
  iconContainer: {
    backgroundColor: "#ffffff",
    padding: 30,
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  flatListContent: {
    flexGrow: 1,
  },
  text: {
    marginTop: 5,
    fontSize: 14,
    textAlign: "center",
  },
});

export default Categories;
