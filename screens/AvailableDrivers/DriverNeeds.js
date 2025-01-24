import React, { useContext, useEffect, useRef, useState } from "react";
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
import Constants from 'expo-constants'


const DriverNeeds = ({navigation}) => {


  // google api key
  const googleApiKey = Constants.expoConfig?.extra?.REACT_APP_GOOGLE_PLACES_KEY


  const { isLoading, setIsLoading } = useContext(LoadNeedsContext);


  const [spinner, setSpinner] = useState(false);

  const textInputRef = useRef(null); // Create a reference for the TextInput


  const [driverName, setDriverName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [truckName, setTruckName] = useState("");
  const [truckBodyType, setTruckBodyType] = useState("");
  const [numberOfTyres, setNumberOfTyres] = useState("");
  const [description, setDescription] = useState("");

  const [fromLocationModal, setFromLocationModal] = useState(false)
  const [toLocationModal, setToLocationModal] = useState(false)

  const [vehicleListData, setVehicleListData] = useState([])
  const [vehicleFromDropdown, setVehicleFromDropdown] = useState("")

  // State variables to track input field validity
  const [driverNameValid, setDriverNameValid] = useState(true);
  const [vehicleNumberValid, setVehicleNumberValid] = useState(true);
  const [companyNameValid, setCompanyNameValid] = useState(true);
  const [contactNumberValid, setContactNumberValid] = useState(true);
  const [fromLocationValid, setFromLocationValid] = useState(true);
  const [toLocationValid, setToLocationValid] = useState(true);
  const [truckNameValid, setTruckNameValid] = useState(true);
  const [truckBodyTypeValid, setTruckBodyTypeValid] = useState(true);
  const [numberOfTyresValid, setNumberOfTyresValid] = useState(true);
  const [descriptionValid, setDescriptionValid] = useState(true);



  useEffect(() => {

    const getVehicleList = async () => {

      const vehicleListParams = {
        user_id: `${await AsyncStorage.getItem("user_id")}`
      }


      try {


        const response = await axiosInstance.post("/get_user_vehicle_list", vehicleListParams);
        if (response.data.error_code === 0) {
          setVehicleListData(
            response.data.data[0].vehicle_list.map((value, index) => ({
              label: value,
              value: value
            }))
          )
        }

      } catch (error) {
        console.error(error);
      }
    }

    (async () => getVehicleList())()

  }, [])



  const handlePostAdd = async () => {
    setSpinner(true); // Show spinner while making API call

    if (
      // driverName.trim() === "" ||
      companyName.trim() === "" ||
      contactNumber.trim() === "" ||
      fromLocation.trim() === "" ||
      toLocation.trim() === "" ||
      // truckName.trim() === "" ||
      truckBodyType.trim() === "" ||
      numberOfTyres.trim() === "" 
    ) {
      Alert.alert("Please fill in all the fields.");
      setDriverNameValid(driverName.trim() !== "");
      setVehicleNumberValid(vehicleNumber.trim() !== "");
      setCompanyNameValid(companyName.trim() !== "");
      setContactNumberValid(contactNumber.trim() !== "");
      setFromLocationValid(fromLocation.trim() !== "");
      setToLocationValid(toLocation.trim() !== "");
      setTruckNameValid(truckName.trim() !== "");
      setTruckBodyTypeValid(truckBodyType.trim() !== "");
      setNumberOfTyresValid(numberOfTyres.trim() !== "");
      setSpinner(false); // Hide spinner
      return;
    }

    const postData = {
      driver_name: driverName,
      vehicle_number: vehicleNumber !== "" ? vehicleNumber : vehicleFromDropdown,
      company_name: companyName,
      contact_no: contactNumber,
      from: fromLocation,
      to: toLocation,
      truck_name: truckName,
      truck_body_type: truckBodyType,
      no_of_tyres: numberOfTyres,
      description: description,
      user_id: await AsyncStorage.getItem("user_id")
    };

    try {


      const response = await axiosInstance.post("/driver_entry", postData);
      if (response.data.error_code === 0) {
        setSpinner(false);
        setIsLoading(!isLoading);
        // Reset input fields
        setDriverName("");
        setVehicleNumber("");
        setCompanyName("");
        setContactNumber("");
        setFromLocation("");
        setToLocation("");
        setTruckName("");
        setTruckBodyType("");
        setNumberOfTyres("");
        setDescription("");
        // Reset validation states
        setDriverNameValid(true);
        setVehicleNumberValid(true);
        setCompanyNameValid(true);
        setContactNumberValid(true);
        setFromLocationValid(true);
        setToLocationValid(true);
        setTruckNameValid(true);
        setTruckBodyTypeValid(true);
        setNumberOfTyresValid(true);
        setDescriptionValid(true);
        Alert.alert("Post added successfully!");
        navigation.navigate("AvailableDrivers")
      } else {
        setSpinner(false);
        console.error("Error adding post:", response.data.error_message);
        Alert.alert("Failed to add post. Please try again later.");
      }
    } catch (error) {
      setSpinner(false);
      console.error("API Error:", error);
      Alert.alert("Failed to add post. Please try again later.");
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
        <HeaderWithOutBS title="Driver Needs" />

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.textInputContainer}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.label}>Vehicle Number</Text>
              <Text style={{ textAlign: 'right', textDecorationLine: 'underline', color: 'blue' }} onPress={() => navigation.navigate("Profile")}>Add Truck</Text>
            </View>
            <TextInput
              style={[
                styles.textInput,
              ]}
              placeholder="Enter your vehicle number"
              onChangeText={setVehicleNumber} // Simplified

              value={vehicleNumber}
              onFocus={() => {
                setVehicleFromDropdown(''); // Clear dropdown value on focus
                textInputRef.current.focus()
              }}
              ref={textInputRef}
            />
            <Text style={{ textAlign: 'center', marginBottom: 8 }}>OR</Text>
            <View style={{ borderColor: "grey", borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
              <RNPickerSelect
                onValueChange={(value) => {
                  setVehicleFromDropdown(value); // Set dropdown value
                  setVehicleNumber(''); // Clear TextInput if desired, otherwise comment this out
                  textInputRef.current.blur(); // Remove focus from TextInput
                }}
                items={vehicleListData}
                value={vehicleFromDropdown}
                placeholder={{
                  label: 'Select vehicle number from profile',
                  value: null,
                  color: 'grey',
                }}


              />
            </View>

            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={[
                styles.textInput,
                !companyNameValid && { borderColor: "red" },
              ]}
              placeholder="Enter your company name"
              onChangeText={setCompanyName}
              value={companyName}
            />

            <Text style={styles.label}>Owner Name</Text>
            <TextInput
              style={[
                styles.textInput,
                !driverNameValid && { borderColor: "red" },
              ]}
              placeholder="Enter your owner name"
              onChangeText={setDriverName}
              value={driverName}
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
              placeholder="Starting Location"
              value={fromLocation}
              onPress={() => setFromLocationModal(true)}
            />

            <Text style={styles.label}>To</Text>
            <TextInput
              style={[
                styles.textInput,
                !toLocationValid && { borderColor: "red" },
              ]}
              placeholder="Destination Location"
              value={toLocation}
              onPress={() => setToLocationModal(true)}
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
    padding: 13,
    marginBottom: 10,
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

export default DriverNeeds;
