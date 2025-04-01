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
import { COLORS } from "../constants";
import HeaderWithOutBS from "../components/HeaderWithOutBS";
import axiosInstance from "../services/axiosInstance";
import { LoadNeedsContext } from "../hooks/LoadNeedsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from "@react-navigation/native";
import Constants from 'expo-constants'
import { statesData } from "../constants/cityAndState";
import { MultiSelect } from "react-native-element-dropdown";
import Checkbox from "expo-checkbox";




const TruckNeeds = () => {

  // google api key
  const googleApiKey = Constants.expoConfig?.extra?.REACT_APP_GOOGLE_PLACES_KEY


  const navigation = useNavigation("")

  const { isLoading, setIsLoading } = useContext(LoadNeedsContext);

  const [spinner, setSpinner] = useState(false);

  const textInputRef = useRef(null); // Create a reference for the TextInput


  const [vehicleNumber, setVehicleNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [transportName, setTransportName] = useState("")
  const [fromLocation, setFromLocation] = useState("");
  const [ton, setTon] = useState("");
  const [truckSize, setTruckSize] = useState("");

  const [truckName, setTruckName] = useState("");
  const [truckBodyType, setTruckBodyType] = useState("");
  const [numberOfTyres, setNumberOfTyres] = useState("");
  const [description, setDescription] = useState("");

  // State variables to track input field validity
  const [vehicleNumberValid, setVehicleNumberValid] = useState(true);
  const [companyNameValid, setCompanyNameValid] = useState(true);
  const [contactNumberValid, setContactNumberValid] = useState(true);
  const [transportNameValid, setTransportNameValid] = useState(true)
  const [fromLocationValid, setFromLocationValid] = useState(true);
  const [tonValid, setTonValid] = useState(true);
  const [truckSizeValid, setTruckSizeValid] = useState(true);
  const [truckNameValid, setTruckNameValid] = useState(true);
  const [truckBodyTypeValid, setTruckBodyTypeValid] = useState(true);
  const [numberOfTyresValid, setNumberOfTyresValid] = useState(true);
  const [descriptionValid, setDescriptionValid] = useState(true);

  const [fromLocationModal, setFromLocationModal] = useState(false)

  const [vehicleListData, setVehicleListData] = useState([])
  const [vehicleFromDropdown, setVehicleFromDropdown] = useState("")


  const [selectedToLocationStates, setSelectedToLocationStates] = useState([]);
  const [selectAllToLocationStates, setSelectAllToLocationStates] = useState(false);



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

  const toLocationStatesData = statesData.map(state => (
    { label: state.name, value: state.name })
  );



  const handlePostAdd = async () => {
    setSpinner(true);
    // Validate input fields
    if (
      companyName.trim() === "" ||
      contactNumber.trim() === "" ||
      transportName.trim() === "" ||
      fromLocation.trim() === "" ||
      ton.trim() === "" ||
      truckSize.trim() === "" ||
      truckName.trim() === "" ||
      truckBodyType.trim() === "" ||
      numberOfTyres.trim() === ""
    ) {
      Alert.alert("Please fill in all the fields.");
      setVehicleNumberValid(vehicleNumber.trim() !== "");
      setCompanyNameValid(companyName.trim() !== "");
      setContactNumberValid(contactNumber.trim() !== "");
      setTransportNameValid(transportName.trim() !== "")
      setFromLocationValid(fromLocation.trim() !== "");
      setTonValid(ton.trim() !== "");
      setTruckSizeValid(truckSize.trim() !== "");
      setTruckNameValid(truckName.trim() !== "");
      setTruckBodyTypeValid(truckBodyType.trim() !== "");
      setNumberOfTyresValid(numberOfTyres.trim() !== "");
      setSpinner(false);
      return;
    }

    // Prepare data to send
    const postData = {
      company_name: companyName,
      contact_no: contactNumber,
      description: description,
      from: fromLocation,
      // to: toLocation,
      to: selectedToLocationStates,
      vehicle_number: vehicleNumber !== "" ? vehicleNumber : vehicleFromDropdown,
      name_of_the_transport: transportName,
      no_of_tyres: numberOfTyres,
      tone: ton,
      truck_size: truckSize,
      truck_name: truckName,
      truck_brand_name: truckName,
      truck_body_type: truckBodyType,
      user_id: await AsyncStorage.getItem("user_id")
    };


    try {

      // Send POST request to your API endpoint
      const response = await axiosInstance.post("/truck_entry", postData);
      if (response.data.error_code === 0) {
        setIsLoading(!isLoading);
        setVehicleNumber("");
        setCompanyName("");
        setContactNumber("");
        setFromLocation("");
        setTransportName("")
        setTon("");
        setTruckSize("")
        setTruckName("");
        setTruckBodyType("");
        setNumberOfTyres("");
        setDescription("");
        setSelectAllToLocationStates(false)
        setSelectedToLocationStates([])
        Alert.alert("Post added successfully!");
        navigation.goBack()
      } else {
        Alert.alert("Failed to add post. Please try again later.");
      }
      // Optionally, reset form fields after successful submission



    } catch (error) {
      console.error("Error adding post:", error);
      Alert.alert("Failed to add post. Please try again later.");
    } finally {
      setSpinner(false);
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

    // You can use the extracted details as needed
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



  const handleFilterStates = (values) => {
    setSelectedToLocationStates(values);
  };

  const toggleSelectAll = () => {
    if (selectAllToLocationStates) {
      setSelectedToLocationStates([]); // Deselect all
    } else {
      setSelectedToLocationStates(statesData.map((item) => item.name)); // Select all states
    }
    setSelectAllToLocationStates(!selectAllToLocationStates);
  };




  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <HeaderWithOutBS title="Add Truck" />

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
            <Text style={styles.label}>Owner Name</Text>
            <TextInput
              style={[
                styles.textInput,
                !companyNameValid && { borderColor: "red" },
              ]}
              placeholder="Enter your owner name"
              onChangeText={setCompanyName}
              value={companyName}
            />
            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={[
                styles.textInput,
                !contactNumberValid && { borderColor: "red" },
              ]}
              placeholder="Contact Number"
              onChangeText={(text) => setContactNumber(text)} // Ensure only Contact Number state updates
              value={contactNumber}
              keyboardType="number-pad"
              maxLength={10}
            />
            <Text style={styles.label}>Name of the transport</Text>
            <TextInput
              style={[
                styles.textInput,
                !companyNameValid && { borderColor: "red" },
              ]}
              placeholder="Enter your transport name"
              onChangeText={setTransportName}
              value={transportName}
            />

            <Text style={styles.label}>Ton</Text>
            <TextInput
              style={[styles.textInput, !tonValid && { borderColor: "red" }]}
              placeholder="Example : 2"
              onChangeText={setTon}
              value={ton}
              keyboardType="number-pad"

            />

            <Text style={styles.label}>Truck size</Text>
            <TextInput
              style={[
                styles.textInput,
                !truckSizeValid && { borderColor: "red" },
              ]}
              placeholder="Example: 10ft"
              onChangeText={(text) => setTruckSize(text)} // Ensure only Truck Size state updates
              value={truckSize}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Brand Name</Text>

            <View style={{ borderColor: COLORS.gray, borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
              <RNPickerSelect
                onValueChange={(value) => setTruckName(value)}
                items={brandData}
                value={truckName}
                placeholder={{
                  label: 'Select brand name',
                  value: null,
                  color: 'grey',
                }}
              />
            </View>

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


            <View style={{ marginBottom: 10 }}>
              <Text style={styles.label}>To</Text>

              {/* Show dropdown only if not all states are selected */}
              {!selectAllToLocationStates && (
                <MultiSelect
                  style={{
                    borderColor: "#ccc",
                    borderWidth: 1,
                    padding: 12,
                    borderRadius: 5,
                    marginBottom: 10,
                    fontSize: 16,
                    backgroundColor: "white",
                  }}
                  data={toLocationStatesData} // Use actual states data
                  labelField="label" // Ensure correct field names
                  valueField="value"
                  placeholder={selectedToLocationStates.length ? `${selectedToLocationStates.length} states selected` : "To Location"}
                  value={selectedToLocationStates}
                  onChange={handleFilterStates}
                  placeholderStyle={{ fontSize: 16 }}
                />
              )}

              {
                selectAllToLocationStates &&
                <TextInput
                  style={{
                    borderColor: "#ccc",
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 5,
                    marginBottom: 10,
                    fontSize: 16
                  }}
                  value="To Location (All states selected)"
                  editable={false}
                />
              }

              {/* Select All Checkbox */}
              <View >
                <TouchableOpacity onPress={toggleSelectAll} style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
                  <Checkbox value={selectAllToLocationStates} onValueChange={toggleSelectAll} />
                  <Text style={{ marginLeft: 8 }}>Select All States</Text>
                </TouchableOpacity>
              </View>

            </View>

            {/* <Text style={styles.label}>To</Text>
            <View style={{ marginBottom: 10 }}>
              <MultiSelect
                style={{ borderColor: COLORS.gray, borderWidth: 1, padding: 15, borderRadius: 5 }}
                data={data}
                labelField="label"
                valueField="value"
                placeholder="To Location"
                value={selectedStates}
                onChange={handleSelectedStates}
                placeholderStyle={{ fontSize: 16 }}
              />
            </View> */}



            {/* <TextInput
              style={[
                styles.textInput,
                !toLocationValid && { borderColor: "red" },
              ]}
              placeholder="Destination Location"
              value={toLocation}
              onPress={() => setToLocationModal(true)}
            /> */}


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
      {/* <Modal
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
      </Modal> */}


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
  },
  icon: {
    marginRight: 5,
  },
  mobileNumberInputBox: {
    width: "100%",
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderColor: 'grey',
    borderWidth: 1,
    flexDirection: 'row'
  },
  placeholderStyle: {
    fontSize: 14,
    color: 'grey'
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
    marginRight: 15,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
  },
  itemContainerStyle: {

  },
  itemTextStyle: {
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  multiSelectBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
  },
  multiSelectBox: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'grey',
    padding: 15,
    paddingLeft: 15,
    marginBottom: 4,
  },
  selectToggleText: {
    color: '#000',
    fontSize: 14
  },
  selectText: {
    color: 'red'
  },
  selectedItemText: {
    color: COLORS.primary,
  },
  multiSelectChipContainer: {
    borderWidth: 0,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  multiSelectChipText: {
    color: '#222',
    fontSize: 12,
  }
});

export default TruckNeeds;
