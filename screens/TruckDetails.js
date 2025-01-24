import React, { useState } from "react";
import {
  Text,
  View,
  SafeAreaView,  
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, images } from "../constants";
import { useNavigation } from "@react-navigation/native";

const TruckDetails = () => {

  const navigation = useNavigation()

  const [tour, setTour] = useState({
    images: [
      {
        image: images.truck,
      },
      {
        image: images.truck1,
      },
    ],
    title: "Ashok Leyland Lorry",
    description:
      "In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder befor",
    rating: "4",
    price: "34,49,000",
    duration: "12",
  });

  const [TruckImage, setTruckImage] = useState(tour.images[0].image);

  const changeImage = (image) => {
    setTruckImage(image);
  };

  const goBack = () => {
    navigation.goBack();
  }

  return (
    <>
      <ScrollView>
        <ImageBackground source={TruckImage} style={styles.imageBackground}>
          <SafeAreaView>                       
            <View style={styles.imageContainer}>            
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <Ionicons name="arrow-back" size={24} color={COLORS.black} />
              </TouchableOpacity>                            
            </View>
          </SafeAreaView>
        </ImageBackground>
        <View style={styles.detailsContainer}>
          
          <View style={styles.titlePriceContainer}>
            <Text style={styles.titleText}>{tour.title}</Text>           
          </View>
          <Text style={styles.priceText}>₹ {tour.price}</Text>
          <View>
            <Text style={styles.descriptionText}>{tour.description}</Text>
          </View>
          <View style={styles.durationRatingContainer}>
            <View style={styles.infoIconContainer}>
              <Ionicons
                name="car-sport-outline"
                size={10 * 3}
                color={COLORS.brand}
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>Lorry Details</Text>
              <Text style={styles.descriptionText}>2003</Text>
            </View>
            <View style={styles.infoIconContainer}>
              <Ionicons
                name="cash-outline"
                size={10 * 3}
                color={COLORS.brand}
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>Lorry Details</Text>
              <Text style={styles.descriptionText}>Available</Text>
            </View>
          </View>
          <View style={styles.durationRatingContainer}>
            <View style={styles.infoIconContainer}>
              <Ionicons
                name="phone-landscape"
                size={10 * 3}
                color={COLORS.brand}
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>Contact Dealers</Text>
              <Text style={styles.descriptionText}>{tour.duration}</Text>
            </View>
            <View style={styles.infoIconContainer}>
              <Ionicons
                name="location-outline"
                size={10 * 3}
                color={COLORS.brand}
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>Location</Text>
              <Text style={styles.descriptionText}>Coimbatore, India</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.bookNowContainer}>
        <TouchableOpacity style={styles.bookNowButton}>
          <Text style={styles.bookNowText}>Contact</Text>
          <Ionicons name="arrow-forward" size={10 * 3} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    width: "100%",
    height: 500,
  },
  imageContainer: {
    paddingHorizontal: 10,
    paddingVertical: 50,
    justifyContent: "space-between",
    flexDirection: "row",
    height: "100%",
  },
  backButton: {
    backgroundColor: COLORS.white,
    width: 10 * 4,
    height: 10 * 4,
    borderRadius: 10 * 2,
    justifyContent: "center",
    alignItems: "center",
  },
  heartButton: {
    backgroundColor: COLORS.white,
    width: 10 * 4,
    height: 10 * 4,
    borderRadius: 10 * 2,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryImageContainer: {
    width: 10 * 6,
    height: 10 * 6,
    padding: 10 / 2,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 10,
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  detailsContainer: {
    backgroundColor: COLORS.white,
    padding: 10 * 2,
    borderRadius: 10 * 3,
    bottom: 10 * 3,
  },
  titlePriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleText: {
    fontSize: 10 * 2,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  priceText: {
    fontSize: 8 * 2,
    fontWeight: "bold",
    color: COLORS.brand,
    marginTop: 10,
    marginBottom: 10,
  },
  durationRatingContainer: {
    marginVertical: 10 * 2,
    flexDirection: "row",
    marginBottom: 10 * 2,
    justifyContent: "space-evenly",
  },
  infoIconContainer: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 10 / 2, height: 10 },
    shadowRadius: 10 / 2,
    shadowOpacity: 0.1,
    padding: 10 / 2,
    borderRadius: 10 / 2,
    marginRight: 10,
  },
  infoTextContainer: {
    marginRight: 10 * 2,
  },
  infoText: {
    fontSize: 10 + 1,
    marginBottom: 10 / 2,
    textTransform: "uppercase",
  },
  descriptionText: {
    color: COLORS.dark,
  },
  bookNowContainer: {
    position: "absolute",
    bottom: 10 * 2,
    width: "100%",
  },
  bookNowButton: {
    backgroundColor: COLORS.brand,
    padding: 10 * 1.5,
    marginHorizontal: 10 * 1.6,
    borderRadius: 10 * 2,
    flexDirection: "row",
    justifyContent: "center",
  },
  bookNowText: {
    color: COLORS.white,
    fontSize: 10 * 2,
    fontWeight: "bold",
    marginRight: 10 * 7,
    marginLeft: 10 * 7,
  },
});

export default TruckDetails;
