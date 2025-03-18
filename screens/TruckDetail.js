import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderWithOutBS from "../components/HeaderWithOutBS";
import { COLORS } from "../constants";
import axiosInstance from "../services/axiosInstance";
import { useNavigation } from "@react-navigation/native";
import { LoadNeedsContext } from "../hooks/LoadNeedsContext";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Icon1 from "react-native-vector-icons/MaterialIcons";
import AntDesign from '@expo/vector-icons/AntDesign';
import SendMessageModal from "./SendMessageModal";





const TruckDetail = ({ route }) => {
  const { item } = route.params;

  const {
    setMessageReceiver,
    
  } = useContext(LoadNeedsContext)
  const navigation = useNavigation("")

  const [fullProductDetails, setFullProductDetails] = useState({
    images: [],
  });

  const [formattedTime, setFormattedTime] = useState("")

  const [sendMessageModal, setSendMessageModal] = useState(false)



  useEffect(() => {
    const fetchFullProductDetails = async () => {
      try {
        const fullProductDetailParameter = {
          buy_sell_id: item.buy_sell_id,
        };
        const response = await axiosInstance.post(
          "/buy_sell_id_details",
          fullProductDetailParameter
        );

        if (response.data.error_code === 0) {

          setFullProductDetails(response.data.data[0]);

          if (response.data.data[0].updt) {
            const dateObject = new Date(response.data.data[0].updt);

            // Format the date as "23 Sep 2024"
            const formattedDate = dateObject.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });

            // Format the time as "04:13 PM"
            const formattedTime = dateObject.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
              timeZone: 'UTC' // Ensure the time is shown in GMT/UTC
            });

            const finalResult = `${formattedDate} ${formattedTime}`;
            setFormattedTime(finalResult)
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchFullProductDetails();
  }, [item.buy_sell_id]);

  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    if (fullProductDetails.images && fullProductDetails.images.length > 0) {
      setSelectedImage(fullProductDetails.images[0]);
    }
  }, [fullProductDetails]);

  const renderImages = () => {
    return (
      <View style={styles.imagesContainer}>
        {/* Main Image Display */}
        <View style={styles.mainImageContainer}>
          {selectedImage ? (
            <Image style={styles.mainImage} source={{ uri: selectedImage }} />
          ) : (
            <Text>No Image Available</Text>
          )}
        </View>
  
        {/* Scrollable Thumbnails */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.smallImagesScroll}>
          <View style={styles.smallImagesContainer}>
            {fullProductDetails.images &&
              fullProductDetails.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(image)}
                  style={styles.smallImageContainer}
                >
                  <Image style={styles.smallImage} source={{ uri: image }} />
                </TouchableOpacity>
              ))}
          </View>
        </ScrollView>
      </View>
    );
  };
  

  if (!fullProductDetails.brand) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleChatNavigate = () => {
    setMessageReceiver(fullProductDetails)
    navigation.navigate("Chat")
  }


  const handleYes = () => {
    setSendMessageModal(false);
    navigation.navigate("Chat")
  };

  const handleCancel = () => {
    setSendMessageModal(false);
  };



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <HeaderWithOutBS title="Truck Details" />
        <ScrollView style={styles.content}>
          <View style={[styles.card]}>

            <View style={styles.cardContent}>{renderImages()}</View>
            <View style={styles.productCardHeader}>
              <Text style={[styles.name]}>{fullProductDetails.brand}</Text>
            </View>

            <View style={[styles.ratingsContainer]}>
              <View style={styles.starsContainer}>
                {[...Array(5)].map((_, index) => (
                  <FontAwesome
                  key={index}
                  name={index > 2 ? "star-o" : "star"}
                  size={13}
                  color="#FFD700"
                 />
                  // <FontAwesome
                  //   key={index}
                  //   name={index > 2 ? "star-o" : "star"}
                  //   size={13}
                  //   color="#FFD700"
                  // />
                ))}
              </View>
              <Text style={styles.textRight}>Posts :{1} </Text>
            </View>

            <View style={styles.locationContainer}>
              <Icon1 name="place" size={24} color="green" />
              <Text style={styles.location}>{fullProductDetails.location}</Text>
            </View>
            <View style={styles.locationContainer}>
              <AntDesign name="calendar" size={20} color={COLORS.gray} />
              <Text style={styles.location}>{formattedTime}</Text>
            </View>

            <View>

            </View>

          </View>

          <View style={styles.card}>

            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Brand name</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.description}>{fullProductDetails.brand}</Text>
            </View>

            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Owner Name</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.description}>
                {fullProductDetails.owner_name}
              </Text>
            </View>

            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Model</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.description}>{fullProductDetails.model}</Text>
            </View>

            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Vehicle number</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.description}>
                {fullProductDetails.vehicle_number}
              </Text>
            </View>

            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Kms Driven</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.description}>
                {fullProductDetails.kms_driven}
              </Text>
            </View>


            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Price</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.description}>
              ₹ {fullProductDetails.price}
              </Text>
            </View>

            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>No of tyres</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.description}>
                {fullProductDetails.no_of_tyres}
              </Text>
            </View>

            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Tonnage</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.description}>
                {fullProductDetails.tonnage}
              </Text>
            </View>

            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Truck body type</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.description}>
                {fullProductDetails.truck_body_type}
              </Text>
            </View>




            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Location</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.description}>
                {fullProductDetails.location}
              </Text>
            </View>

            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Description(Optional)</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.description}>
                {fullProductDetails.description}
              </Text>
            </View>

            <View style={styles.cardContent}>
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: 'green' }]}
                onPress={() =>
                  Linking.openURL(`tel:${fullProductDetails.contact_no}`)
                }
              >
                <Text style={styles.shareButtonText}>Call</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.cardContent, { paddingBottom: 30 }]}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => setSendMessageModal(true)}
              >
                <Text style={styles.shareButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.card}>
          </View>
        </ScrollView>
      </View>

      {/* Send Message Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sendMessageModal}
        onRequestClose={() => setSendMessageModal(false)}
      >
        <SendMessageModal handleYes={handleYes} handleCancel={handleCancel} />
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    marginLeft: 10,
    marginRight: 10,
  },
  card: {
    shadowColor: "#00000021",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
    backgroundColor: "white",
    marginHorizontal: 5,
  },
  productCardHeader: {
    paddingTop: 12.5,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  name: {
    fontSize: 24,
    color: "#696969",
    fontWeight: "bold",
  },
  price: {
    marginTop: 10,
    fontSize: 18,
    color: "green",
    fontWeight: "bold",
  },
  cardContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12.5,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,

  },
  cardTitle: {
    color: "#000",
    fontSize : 14,
    fontStyle:'italic',
    
  },
  description: {
    fontSize: 17,
    color: "#000",
    fontWeight : "700",
    marginTop : -5
  },
  shareButton: {
    marginTop: 10,
    height: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: COLORS.brand,
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
  },
  imagesContainer: {
    alignItems: "center",
  },
  mainImageContainer: {
    marginTop: 5,
    alignItems: "center",
  },
  mainImage: {
    width: 300,
    height: 300,
  },
  smallImagesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  smallImageContainer: {
    paddingHorizontal: 10,
  },
  smallImage: {
    width: 60,
    height: 60,
  },
  ratingsContainer: {

    marginHorizontal: 15,
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row', // Align stars horizontally
  },
  textRight: {
    marginTop: 8,
    fontWeight: '600'
  },

  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "flex-start",
    marginLeft: 12
  },
  location: {
    fontSize: 16,
    marginLeft: 5,
  },

});

export default TruckDetail;
