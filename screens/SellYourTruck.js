import React, { useContext, useState } from "react";
import {
  StyleSheet,
  View,
  Button,
  Alert,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { COLORS } from "../constants";
import HeaderWithOutBS from "../components/HeaderWithOutBS";
import axiosInstance from "../services/axiosInstance";
import { LoadNeedsContext } from "../hooks/LoadNeedsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from 'react-native-picker-select';
import Constants from 'expo-constants'
import AntDesign from '@expo/vector-icons/AntDesign';




const SellYourTruck = () => {

  // google api key
  const googleApiKey = Constants.expoConfig?.extra?.REACT_APP_GOOGLE_PLACES_KEY

  const navigation = useNavigation("")


  const { isLoading, setIsLoading } = useContext(LoadNeedsContext)
  const [loading, setLoading] = useState(false)
  const [ownerName, setOwnerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [kmsDriven, setKmsDriven] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [truckBodyType, setTruckBodyType] = useState("");
  const [numberOfTyres, setNumberOfTyres] = useState("");
  const [ton, setTon] = useState("");


  const [ownerNameValid, setOwnerNameValid] = useState(true);
  const [contactNumberValid, setContactNumberValid] = useState(true);
  const [vehicleNumberValid, setVehicleNumberValid] = useState(true);
  const [kmsDrivenValid, setKmsDrivenValid] = useState(true);
  const [brandValid, setBrandValid] = useState(true);
  const [modelValid, setModelValid] = useState(true);
  const [priceValid, setPriceValid] = useState(true)
  const [tonValid, setTonValid] = useState(true);

  const [locationValid, setLocationValid] = useState(true);
  const [descriptionValid, setDescriptionValid] = useState(true);

  const [locationModal, setLocationModal] = useState(false)

  const handlePostAdd = async () => {


    if (
      ownerName.trim() === "" ||
      contactNumber.trim() === "" ||
      vehicleNumber.trim() === "" ||
      kmsDriven.trim() === "" ||
      brand.trim() === "" ||
      model.trim() === "" ||
      price.trim() === "" ||
      location.trim() === "" ||
      ton.trim() === "" ||
      images.length === 0
    ) {
      Alert.alert("Please fill in all the fields and add at least one image.");
      setOwnerNameValid(ownerName.trim() !== "");
      setContactNumberValid(contactNumber.trim() !== "");
      setVehicleNumberValid(vehicleNumber.trim() !== "");
      setKmsDrivenValid(kmsDriven.trim() !== "");
      setBrandValid(brand.trim() !== "");
      setModelValid(model.trim() !== "");
      setPriceValid(price.trim() !== "");
      setLocationValid(location.trim() !== "");
      // setDescriptionValid(description.trim() !== "");
      setTonValid(ton.trim() !== "");

      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('user_id', await AsyncStorage.getItem("user_id"));
    formData.append('owner_name', ownerName);
    formData.append('contact_no', contactNumber);
    formData.append('vehicle_number', vehicleNumber);
    formData.append('kms_driven', kmsDriven);
    formData.append('brand', brand);
    formData.append('model', model);
    formData.append('price', price);
    formData.append('location', location);
    formData.append("truck_body_type", truckBodyType)
    formData.append("no_of_tyres", numberOfTyres)
    formData.append('description', description);
    formData.append('tonnage', ton);


    // Append images to FormData
    images.forEach((image, index) => {
      formData.append(`truck_image${index + 1}`, {
        uri: image.uri,
        type: 'image/jpeg', // Adjust accordingly if different image types
        name: image.fileName, // Use a unique name for the image
      });
    });




    try {

      setLoading(true)

      const response = await axiosInstance.post("/truck_buy_sell", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.error_code === 0) {
        setLoading(false)
        setOwnerName("");
        setContactNumber("");
        setVehicleNumber("");
        setKmsDriven("");
        setBrand("");
        setModel("");
        setPrice("");
        setLocation("");
        setDescription("");
        setTon("");
        setImages([])
        setIsLoading(!isLoading)
        Alert.alert("Post added successfully!");
        navigation.goBack()
      }
    } catch (error) {
      console.error("Error adding post:", error);
      setLoading(false)
    }
  };


  const pickImage = async () => {
    if (images.length >= 3) {
      Alert.alert("Maximum of 3 images can be uploaded.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      // Filter out already selected images and limit to 3
      const newImages = result.assets.slice(0, 3 - images.length);
      setImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  const handleDeleteSelectedImage = (fileName) => {
      const result = images.filter((v,i) =>  {
        return v.fileName !== fileName;
      })
      setImages(result)
  }



  const handleLocation = (data, details) => {
    let country = '';
    let state = '';
    let city = '';

    if (details.address_components) {
      details.address_components.forEach(component => {
        if (component.types.includes('country')) {
          country = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
      });
    }

    setLocation(`${city}, ${state}`)
    setLocationModal(false)
  };

  const brandData = [
    { label: 'Ashok Leyland', value: 'Ashok Leyland' },
    { label: 'Tata', value: 'Tata' },
    { label: 'Mahindra', value: 'Mahindra' },
    { label: 'Eicher', value: 'Eicher' },
    { label: 'Daimler India', value: 'Daimler India' },
    { label: 'Bharat Benz', value: 'Bharat Benz' },
    { label: 'Maruthi Suzuki', value: 'Maruthi Suzuki' },
    { label: 'SML Lsuzu', value: 'SML Lsuzu' },
    { label: 'Force', value: 'Force' },
    { label: 'AMW', value: 'AMW' },
    { label: 'Man', value: 'Man' },
    { label: 'Volvo', value: 'Volvo' },
    { label: 'Scania', value: 'Scania' },
    { label: 'Others', value: 'Others' },
  ]


  const bodyTypeData = [
    { label: 'Open body', value: 'Open body' },
    { label: 'Container', value: 'Container' },
    { label: 'Trailer', value: 'Trailer' },
    { label: 'Tanker', value: 'Tanker' },
    { label: 'Tipper', value: 'Tipper' },
    { label: 'LCV', value: 'LCV' },
  ];

  const numberOfTyresData = [
    { label: '4', value: '4' },
    { label: '6', value: '6' },
    { label: '10', value: '10' },
    { label: '12', value: '12' },
    { label: '14', value: '14' },
    { label: '16', value: '16' },
    { label: '18', value: '18' },
    { label: '20', value: '20' },
    { label: '22', value: '22' },
  ];



  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, index) => {
    const year = currentYear - index;
    return {
      label: `${year}`,
      value: `${year}`,
    };
  });

  const yearsData = years


  const handleContactNumberChange = (value) => {
    // Validate or process the value if needed
    const sanitizedValue = value.replace(/[^0-9]/g, ""); // Allow only numbers
    setContactNumber(sanitizedValue); // Update state with the sanitized value
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <HeaderWithOutBS title="Sell Your Truck" />

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.textInputContainer}>

            <Text style={styles.label}>Model Year</Text>
            <View style={{ borderColor: COLORS.gray, borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>

              <RNPickerSelect
                onValueChange={(value) => setModel(value)}
                items={yearsData}
                value={model}
              />
            </View>

            <Text style={styles.label}>Brand</Text>
            <View style={{ borderColor: COLORS.gray, borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
              <RNPickerSelect
                onValueChange={(value) => setBrand(value)}
                items={brandData}
                value={brand}
              />
            </View>

            <Text style={styles.label}>Owner Name</Text>
            <TextInput
              style={[
                styles.textInput,
                !ownerNameValid && { borderColor: "red" },
              ]}
              placeholder="Name of the Dealer"
              onChangeText={setOwnerName}
              value={ownerName}
            />


            <Text style={styles.label}>Vehicle Number</Text>
            <TextInput
              style={[
                styles.textInput,
                !vehicleNumberValid && { borderColor: "red" },
              ]}
              placeholder="TN77AX6666"
              onChangeText={setVehicleNumber}
              value={vehicleNumber}
            />

            <Text style={styles.label}>Kms Driven</Text>
            <TextInput
              style={[
                styles.textInput,
                !kmsDrivenValid && { borderColor: "red" },
              ]}
              placeholder="250000"
              keyboardType="number-pad"
              onChangeText={setKmsDriven} // Correctly mapped to kmsDriven
              value={kmsDriven}
            />

            <Text style={styles.label}>Price</Text>
            <TextInput
              style={[styles.textInput, !priceValid && { borderColor: "red" }]}
              placeholder="Price"
              onChangeText={setPrice}
              value={price}
              keyboardType="number-pad"
            />

            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={[
                styles.textInput,
                !contactNumberValid && { borderColor: "red" },
              ]}
              placeholder="Type Your Number"
              keyboardType="number-pad"
              onChangeText={handleContactNumberChange} // Use custom handler
              value={contactNumber}
              maxLength={10}
            />


            <Text style={styles.label}>Location</Text>
            <TextInput
              style={[
                styles.textInput,
                !locationValid && { borderColor: "red" },
              ]}
              placeholder="Location"
              value={location}
              onPress={() => setLocationModal(true)}
            />

            <Text style={styles.label}>Truck Body Type</Text>
            <View style={{ borderColor: COLORS.gray, borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
              <RNPickerSelect
                onValueChange={(value) => setTruckBodyType(value)}
                items={bodyTypeData}
                value={truckBodyType}
                placeholder={{
                  label: 'Select truck body type',
                  value: null,
                  color: 'grey',
                }}
              />
            </View>


            <Text style={styles.label}>No. of Tyres</Text>

            <View style={{ borderColor: COLORS.gray, borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
              <RNPickerSelect
                onValueChange={(value) => setNumberOfTyres(value)}
                items={numberOfTyresData}
                value={numberOfTyres}
                placeholder={{
                  label: 'Select number of tyres',
                  value: null,
                  color: 'grey',
                }}
              />
            </View>

            <Text style={styles.label}>Ton</Text>
            <TextInput
              style={[styles.textInput, !tonValid && { borderColor: "red" }]}
              placeholder="Example : 2"
              onChangeText={setTon}
              value={ton}
              keyboardType="number-pad"
            />



            <Text style={styles.label}>Description(Optional)</Text>
            <TextInput
              style={[
                styles.textInput,
              ]}
              placeholder="Description"
              onChangeText={setDescription}
              value={description}
            />
            <Button title="Upload Images" onPress={pickImage} />
            <View style={styles.imageContainer}>
              {images.map((image, index) => (
                <View style={styles.selectedImageDeleteBtnContainer}>
                  <Image
                    key={index}
                    source={{ uri: image.uri }}
                    style={styles.image}
                  />
                <TouchableOpacity style={styles.selectedImageDeleteBtn} onPress={() => handleDeleteSelectedImage(image.fileName)}>
                 <AntDesign name="close" size={15} color="white" />
                </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>



          <TouchableOpacity style={styles.postButton} onPress={handlePostAdd} disabled={loading ? true : false}>
            {
              loading ?
                <ActivityIndicator color={COLORS.white} size="small" />
                :
                <Text style={styles.postButtonText}>Add Post</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </View>


      {/* Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={locationModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Location</Text>


            <View style={styles.locationContainer}>
              <GooglePlacesAutocomplete
                placeholder="Search location"
                onPress={handleLocation}
                textInputProps={{
                  autoFocus: true,
                }}
                query={{
                  key: googleApiKey, // Use your hardcoded key if Config is not working
                  language: 'en',
                  components: 'country:in',
                }}
                fetchDetails={true} // This ensures that you get more detailed information about the selected location
                styles={{
                  textInputContainer: styles.locationTextInputContainer,
                  textInput: styles.locationTextInput
                }}
              />
            </View>


            <TouchableOpacity style={styles.closeButton} onPress={() => setLocationModal(false)}>
              <Text style={styles.applyButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  postButtonText: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: "700",
  },
  postButton: {
    backgroundColor: COLORS.brand,
    height: 50,
    borderRadius: 10,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  textInputContainer: {
    flex: 1,
    marginLeft: 12,
    margin: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
    gap:5,
    
  },
  selectedImageDeleteBtnContainer: {
    position:'relative',
    alignItems:'center',
    justifyContent:'center',
    flexDirection:'row'
  },
  selectedImageDeleteBtn : {
    position:'absolute',
    padding : 2,
    top : 0,
    right:10,
    backgroundColor:'red',
    borderRadius:5,
    borderTopRightRadius:0
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    width: "90%",
    borderRadius: 10,
    elevation: 5,
    height: "90%"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  locationContainer: {
    flex: 1,
    padding: 5,
  },
  locationTextInputContainer: {

  },
  locationTextInput: {
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    height: 40,
  },
  closeButton: {
    backgroundColor: "#8a1c33",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  applyButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  dropdown: {
    fontSize: 14,
    width: "100%",
    borderBottomColor: 'gray',
    paddingLeft: 12,
    borderWidth: 1,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 5,
    paddingVertical: 11,
    marginBottom: 10,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 14,
    color: 'grey'
  },
  itemTextStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
});

export default SellYourTruck;
