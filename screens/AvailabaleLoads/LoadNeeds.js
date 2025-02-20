import React, { useState, useContext } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import HeaderWithOutBS from "../../components/HeaderWithOutBS";
import axiosInstance from "../../services/axiosInstance";
import { LoadNeedsContext } from "../../hooks/LoadNeedsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from "@react-navigation/native";
import Constants from 'expo-constants'


const LoadNeeds = () => {

  // google api key
  const googleApiKey = Constants.expoConfig?.extra?.REACT_APP_GOOGLE_PLACES_KEY

  const navigate = useNavigation("")

  const { isLoading, setIsLoading } = useContext(LoadNeedsContext);

  const [spinner, setSpinner] = useState(false);
  const [addPostLoading, setAddPostLoading] = useState(false)


  const [companyName, setCompanyName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [material, setMaterial] = useState("");
  const [ton, setTon] = useState("");
  const [truckBodyType, setTruckBodyType] = useState("");
  const [numberOfTyres, setNumberOfTyres] = useState("");
  const [description, setDescription] = useState("");

  // State variables to track input field validity
  const [companyNameValid, setCompanyNameValid] = useState(true);
  const [contactNumberValid, setContactNumberValid] = useState(true);
  const [fromLocationValid, setFromLocationValid] = useState(true);
  const [toLocationValid, setToLocationValid] = useState(true);
  const [materialValid, setMaterialValid] = useState(true);
  const [tonValid, setTonValid] = useState(true);
  const [truckBodyTypeValid, setTruckBodyTypeValid] = useState(true);
  const [numberOfTyresValid, setNumberOfTyresValid] = useState(true);

  const [fromLocationModal, setFromLocationModal] = useState(false)
  const [toLocationModal, setToLocationModal] = useState(false)

  const handlePostAdd = async () => {
    // Check if any required field is empty
    if (
      companyName.trim() === "" ||
      contactNumber.trim() === "" ||
      fromLocation.trim() === "" ||
      toLocation.trim() === "" ||
      material.trim() === "" ||
      ton.trim() === "" ||
      truckBodyType.trim() === "" ||
      numberOfTyres.trim() === "" 
    ) {
      Alert.alert("Please fill in all the fields.");
      setCompanyNameValid(companyName.trim() !== "");
      setContactNumberValid(contactNumber.trim() !== "");
      setFromLocationValid(fromLocation.trim() !== "");
      setToLocationValid(toLocation.trim() !== "");
      setMaterialValid(material.trim() !== "");
      setTonValid(ton.trim() !== "");
      setTruckBodyTypeValid(truckBodyType.trim() !== "");
      setNumberOfTyresValid(numberOfTyres.trim() !== "");
      setSpinner(false)
      return;
    }

    // Prepare data object to send in the API request
    const postData = {
      company_name: companyName,
      contact_no: contactNumber,
      from: fromLocation,
      to: toLocation,
      material: material,
      tone: ton,
      truck_body_type: truckBodyType,
      no_of_tyres: numberOfTyres,
      description: description,
      user_id: await AsyncStorage.getItem("user_id"),
    };

    try {
          setSpinner(true);

      // Make API call using Axios instance (replace with your actual endpoint)
      const response = await axiosInstance.post("/load_details", postData);

      // Handle API response
      if (response.data.error_code === 0) {
        setIsLoading(!isLoading);
        Alert.alert("Post added successfully!");
        navigate.goBack()
        setCompanyName("");
        setContactNumber("");
        setFromLocation("");
        setToLocation("");
        setMaterial("");
        setTon("");
        setTruckBodyType("");
        setNumberOfTyres("");
        setDescription("");
      } else {
        Alert.alert("Failed to add post. Please try again later.");
      }
    } catch (error) {
      console.error("Error adding post:", error);
      Alert.alert("Failed to add post. Please try again later.");
    } finally {
      setSpinner(false); // Stop loading
    }
  };


  const handleFromLocation = (data, details) => {
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


    setFromLocation(`${city}, ${state}`)
    setFromLocationModal(false)

  };


  const handleToLocation = (data, details) => {
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


    setToLocation(`${city}, ${state}`)
    setToLocationModal(false)

    // You can use the extracted details as needed
  };

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




  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <HeaderWithOutBS title="Add Load"  />

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.textInputContainer}>
            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={[
                styles.textInput,
                !companyNameValid && { borderColor: "red" },
              ]}
              placeholder="Name of the company"
              onChangeText={setCompanyName}
              value={companyName}
            />
            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={[
                styles.textInput,
                !contactNumberValid && { borderColor: "red" },
              ]}
              placeholder="Enter your contact number"
              onChangeText={setContactNumber}
              value={contactNumber}
              keyboardType="number-pad"
              maxLength={10}
            />
            <Text style={styles.label}>From</Text>
            <TextInput
              style={[
                styles.textInput,
                !fromLocationValid && { borderColor: "red" },
              ]}
              placeholder="Enter your location"
              value={fromLocation}
              onPress={() => setFromLocationModal(true)}
            />

            <Text style={styles.label}>To</Text>
            <TextInput
              style={[
                styles.textInput,
                !toLocationValid && { borderColor: "red" },
              ]}
              placeholder="Enter your location"
              value={toLocation}
              onPress={() => setToLocationModal(true)}
            />
            <Text style={styles.label}>Material</Text>
            <TextInput
              style={[
                styles.textInput,
                !materialValid && { borderColor: "red" },
              ]}
              placeholder="Type of material"
              onChangeText={setMaterial}
              value={material}
            />
            <Text style={styles.label}>Ton</Text>
            <TextInput
              style={[styles.textInput, !tonValid && { borderColor: "red" }]}
              placeholder="Example : 2 "
              onChangeText={setTon}
              value={ton}
              keyboardType="number-pad"
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
            <Text style={styles.label}>Description(Optional)</Text>
            <TextInput
              style={[
                styles.textInput,
              ]}
              placeholder="Description"
              onChangeText={setDescription}
              value={description}
            />
          </View>

          {spinner ? (
            <TouchableOpacity style={styles.postButton}>
              <ActivityIndicator color={COLORS.white} size="small" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.postButton} onPress={handlePostAdd}>
              <Text style={styles.postButtonText}>Add Post</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>





      {/* From Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={fromLocationModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>From Location</Text>


            <View style={styles.locationContainer}>
              <GooglePlacesAutocomplete
                placeholder="Search location"
                onPress={handleFromLocation}
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


            <TouchableOpacity style={styles.closeButton} onPress={() => setFromLocationModal(false)}>
              <Text style={styles.applyButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* To Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={toLocationModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>To Location</Text>


            <View style={styles.locationContainer}>
              <GooglePlacesAutocomplete
                placeholder="Search location"
                onPress={handleToLocation}
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


            <TouchableOpacity style={styles.closeButton} onPress={() => setToLocationModal(false)}>
              <Text style={styles.applyButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>






    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
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
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
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
    padding: 12,
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
});

export default LoadNeeds;