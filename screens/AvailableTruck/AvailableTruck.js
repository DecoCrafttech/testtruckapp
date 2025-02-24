import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Linking,
  Modal,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import HeaderWithOutBS from "../../components/HeaderWithOutBS";
import SearchFilter from "../../components/SearchFilter";
import CustomButton from "../../components/CustomButton";
import axiosInstance from "../../services/axiosInstance";
import TruckDetails from "./TruckDetails";
import { LoadNeedsContext } from "../../hooks/LoadNeedsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import RNPickerSelect from 'react-native-picker-select';
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { MaterialIcons as Icon } from '@expo/vector-icons';
import SendMessageModal from "../SendMessageModal";
import Constants from 'expo-constants'
import AntDesign from '@expo/vector-icons/AntDesign';
import CustomButtonWithLoading from "../../components/CustomButtonWithLoading";




const AvailableTruck = ({ navigation }) => {


  // google api key
  const googleApiKey = Constants.expoConfig?.extra?.REACT_APP_GOOGLE_PLACES_KEY


  const {
    isLoading,
    setIsLoading,
    aadhaarOTP,
    setMessageReceiver,
    userStatesFromProfile,

  } = useContext(LoadNeedsContext)

  const [searchQuery, setSearchQuery] = useState("");
  const [getTruckData, setGetTruckData] = useState([]);
  const [isLoadings, setisLoadings] = useState(true);

  const [selectedStates, setSelectedStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([])
  const [userToLocationStatesData, setUserToLocationStatesData] = useState({})

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAadhaarModal, setIsAadhaarModal] = useState(false)

  const [sendMessageModal, setSendMessageModal] = useState(false)
  const [loadingKey, setLoadingKey] = useState(null); // Single loading state



  const [modalValues, setModalValues] = useState({
    companyName: "",
    fromLocation: "",
    toLocation: "",
    material: "",
    noOfTyres: "",
    truckName: "",
    tons: "",
    truckBodyType: "",
  });
  const [errorFields, setErrorFields] = useState({
    companyName: false,
    fromLocation: false,
    toLocation: false,
    material: false,
    noOfTyres: false,
    tons: false,
    truckBodyType: false,
    truckName: false
  });
  const [aadhaar, setAadhaar] = useState("")
  const [aadhaarError, setAadhaarError] = useState("")
  const [showOTPInputBox, setShowOTPInputBox] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null);

  const [fromLocationModal, setFromLocationModal] = useState(false)
  const [toLocationModal, setToLocationModal] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)


  useEffect(() => {
    if (timeLeft === 0) {
      setTimeLeft(null);
    }

    if (!timeLeft) return;

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);




  useEffect(() => {
    setUserToLocationStatesData(
      userStatesFromProfile.map((state, index) => ({
        id: index + 1,
        name: state
      }))
    )
  }, [])


  const navigateToSellYourTruck = async () => {

    try {

      const isAadhaarVerifiedParams = {
        user_id: `${await AsyncStorage.getItem("user_id")}`
      }
      const response = await axiosInstance.post("/check_aadhar_verification", isAadhaarVerifiedParams)
      if (response.data.error_code === 0) {
        if (response.data.data.is_aadhar_verified === true) {

          navigation.navigate("TruckNeeds");
        } else {
          setIsAadhaarModal(true)
          setAadhaar("")
        }
      } else {
        Toast.error(response.data.message)
      }
    } catch (err) {
      console.log(err)
    }
  };


  const handleSearch = (query) => {
    setSearchQuery(query);
  };



  useEffect(() => {
    const getAllTruckDetails = async () => {
      try {
        setPageLoading(true)

        const response = await axiosInstance.get("/all_truck_details");
        if (response.data.error_code === 0) {
          const transformedData = response.data.data.map((item) => ({
            companyName: item.company_name,
            nameOfTheTransport: item.name_of_the_transport,
            updatedTime: item.updt,
            post: item.user_post,
            profileName: item.profile_name,
            title: item.company_name,
            fromLocation: item.from_location,
            toLocation: Array.isArray(item.to_location) ? item.to_location.map(v => v) : [], // Safe mapping
            isAadhaarVerified: item.aadhaar_verified,
            truckSize: item.truck_size,

            labels: [
              { icon: "weight", text: `${item.tone} tons` },
              { icon: "local-shipping", text: item.truck_body_type },
              { icon: "attractions", text: `${item.no_of_tyres} wheels` },
              { icon: "directions-bus", text: item.truck_brand_name },
              { icon: "table-view", text: item.company_name },
              { icon: "fire-truck", text: item.truckSize },
              { icon: "verified", text: "RC verified" },
            ],
            description: item.description,
            onButton1Press: () => Linking.openURL(`tel:${item.contact_no}`),
            onButton2Press: () => {

              setMessageReceiver(item)
              setSendMessageModal(true)
            }
          }));

          setGetTruckData(transformedData);
          setPageLoading(false)

        } else {
          console.error(
            "Error fetching all loads:",
            response.data.error_message
          );
          setPageLoading(false)

        }
      } catch (error) {
        console.error("Error fetching all loads:", error);
        setPageLoading(false)

      } finally {
        setisLoadings(false); // Set loading to false after fetch completes
        setPageLoading(false)

      }
    };

    getAllTruckDetails();
  }, [isLoading]);


  const filteredTrucks = getTruckData.filter(
    (truck) =>
      truck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(truck.toLocation) && truck.toLocation.join(' ').toLowerCase().includes(searchQuery.toLowerCase())) || // Check if it's an array
      truck.nameOfTheTransport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.labels[0].text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.labels[1].text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.labels[2].text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.labels[3].text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.labels[4].text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };


  const handleClearFilter = () => {
    setModalValues({
      companyName: "",
      fromLocation: "",
      toLocation: "",
      material: "",
      noOfTyres: "",
      tons: "",
      truckBodyType: "",
      truckName: ""
    });
    setSelectedStates([])

    setErrorFields({
      companyName: false,
      fromLocation: false,
      toLocation: false,
      material: false,
      noOfTyres: false,
      tons: false,
      truckBodyType: false,
    });
    setIsLoading(!isLoading)
    setIsModalVisible(!isModalVisible);

  }


  const handleInputChange = (field, value) => {
    setModalValues({ ...modalValues, [field]: value });
  };

  const handleAadhaarSubmit = async (key) => {
    if (aadhaar === "") {
      setAadhaarError("Enter your aadhaar number")
      return
    } else {
      setAadhaarError("")
      setLoadingKey(key)
      try {
        const generateOTPParams = {
          id_number: `${aadhaar}`
        }
        const response = await axiosInstance.post("/aadhaar_generate_otp", generateOTPParams)
        if (response.data.error_code === 0) {
          setLoadingKey(null)
          AsyncStorage.setItem("client_id", response.data.data[0].client_id)
          setShowOTPInputBox(true)
          setTimeLeft(60)
        } else {
          setLoadingKey(null)
          Alert.alert(response.data.message)
        }
      } catch (err) {
        setLoadingKey(null)
        console.log(err)
      }
    }
  }

  const resendClick = async (key) => {
    try {
      setIsLoading(true)
      const resendParams = {
        id_number: `${aadhaar}`
      }
      const response = await axiosInstance.post("/aadhaar_generate_otp", resendParams)
      if (response.data.error_code === 0) {
        setIsLoading(false)
        Alert.alert("OTP Resent successfully")
        setTimeLeft(60)
        AsyncStorage.setItem("client_id", response.data.data[0].client_id)
      } else {
        setIsLoading(false)
        Alert.alert(response.data.message)
      }
    } catch (err) {
      setIsLoading(false)
      console.log(err)
    }
  }

  const handleVerifyAadhaarOTP = async (key) => {

    const verifyParams = {
      "client_id": `${await AsyncStorage.getItem("client_id")}`,
      "otp": `${aadhaarOTP}`,
      "user_id": `${await AsyncStorage.getItem("user_id")}`
    }

    try {

      setLoadingKey(key)

      const response = await axiosInstance.post("/aadhaar_submit_otp", verifyParams)


      if (response.data.error_code === 0) {
        setLoadingKey(null)
        Toast.success(response.data.message)
        setIsAadhaarModal(false)
        setTimeLeft(null)
        AsyncStorage.removeItem("client_id")
        navigation.navigate("SellYourTruck");
      } else {
        setLoadingKey(null)
        Alert.alert(response.data.message)
        return
      }

    } catch (err) {
      setLoadingKey(null)
      console.log(err)
    }
  }

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


    setModalValues((prevState) => ({
      ...prevState, fromLocation: (`${city}, ${state}`)
    }))
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


    setModalValues((prevState) => ({
      ...prevState, toLocation: (`${city}, ${state}`)
    }))
    setToLocationModal(false)
  };

  const applyFilter = async () => {

    const filterParams = {
      "contact_no": "",
      "vehicle_number": "",
      "company_name": "",
      "from_location": modalValues.fromLocation,
      "to_location": filteredStates,
      "truck_name": modalValues.truckName !== "" && modalValues.truckName !== undefined && modalValues.truckName !== null ? modalValues.truckName : "",
      "truck_brand_name": modalValues.truckName !== "" && modalValues.truckName !== undefined && modalValues.truckName !== null ? modalValues.truckName : "",
      "truck_body_type": modalValues.truckBodyType !== "" && modalValues.truckBodyType !== undefined && modalValues.truckBodyType !== null ? modalValues.truckBodyType : "",
      "no_of_tyres": modalValues.noOfTyres !== "" && modalValues.noOfTyres !== undefined && modalValues.noOfTyres !== null ? modalValues.noOfTyres : "",
      "tone": modalValues.tons !== "" && modalValues.tons !== undefined && modalValues.tons !== null ? modalValues.tons : "",
    }



    try {

      toggleModal(); // Close modal after applying filter
      setPageLoading(true)

      const response = await axiosInstance.post("/user_truck_details_filter", filterParams)
      if (response.data.error_code === 0) {
        const transformedData = response.data.data.map((item) => ({
          nameOfTheTransport: item.name_of_the_transport,
          companyName: item.company_name,
          updatedTime: item.updt,
          post: item.user_post,
          profileName: item.profile_name,
          title: item.company_name,
          fromLocation: item.from_location,
          toLocation: Array.isArray(item.to_location) ? item.to_location.map(v => v) : [], // Safe mapping
          isAadhaarVerified: item.aadhaar_verified,
          truckSize: item.truck_size,

          labels: [
            { icon: "weight", text: `${item.tone} tons` },
            { icon: "local-shipping", text: item.truck_body_type },
            { icon: "attractions", text: `${item.no_of_tyres} wheels` },
            { icon: "directions-bus", text: item.truck_brand_name },
            { icon: "table-view", text: item.vehicle_number },
            { icon: "fire-truck", text: item.name_of_the_transport },
            { icon: "fire-truck", text: item.truckSize },
            { icon: "verified", text: "RC verified" },
          ],
          description: item.description,
          onButton1Press: () => Linking.openURL(`tel:${item.contact_no}`),
          onButton2Press: () => {

            setMessageReceiver(item)
            setSendMessageModal(true)
          }
        }));
        setGetTruckData(transformedData);
        setPageLoading(false)
      } else {
        console.error(
          "Error fetching all loads:",
          response.data.error_message
        );
        setPageLoading(false)

      }
    } catch (err) {
      console.log(err)
      setPageLoading(false)

    }
  };

  if (isLoadings) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

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

  const tonsData = [
    { label: "1 Ton - 2.5 Ton", value: "1 Ton - 2.5 Ton" },
    { label: "2.5 Ton - 5 Ton", value: "2.5 Ton - 5 Ton" },
    { label: "5 Ton - 10 Ton", value: "5 Ton - 10 Ton" },
    { label: "10 Ton - 20 Ton", value: "10 Ton - 20 Ton" },
    { label: "20 Ton - 40 Ton", value: "20 Ton - 40 Ton" },
    { label: "Above 40 Ton", value: "Above 40 Ton" },
  ]


  const handleSelectStates = async (selectedItemIds) => {
    // Log previously selected states
    const prevSelectedStateNames = selectedStates.map(id => {
      const state = userToLocationStatesData.find(state => state.id === id);
      return state ? state.name : null;
    }).filter(name => name !== null);


    // Update selected states
    setSelectedStates(selectedItemIds);

    // Log currently selected states
    const selectedStateNames = selectedItemIds.map(id => {
      const state = userToLocationStatesData.find(state => state.id === id);
      return state ? state.name : null;
    }).filter(name => name !== null);
    setFilteredStates(selectedStateNames)
  };


  const handleClose = () => {
    setShowOTPInputBox(false)
    setIsAadhaarModal(false)
  }


  const handleYes = () => {
    setSendMessageModal(false);
    navigation.navigate("Chat")
  };

  const handleCancel = () => {
    setSendMessageModal(false);
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <HeaderWithOutBS title="Available Truck" />
        <View style={styles.container}>
          <CustomButton
            title="Post Truck Details"
            onPress={navigateToSellYourTruck}
            backgroundColor="#8a1c33"
            textColor="white"
          />
          <CustomButton
            title="Filter"
            onPress={toggleModal}
            backgroundColor="#8a1c33"
            textColor="white"
          />
        </View>
        <SearchFilter onSearch={handleSearch} />
        {
          pageLoading === false ?
            <TruckDetails navigation={navigation} filteredTrucks={filteredTrucks} availableTruckPage="true" />
            :
            <View style={styles.ActivityIndicatorContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        }
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={[styles.filterHeadingContainer, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }]}>
              <Text style={[styles.modalTitle, { flex: 1, textAlign: 'center' }]}>Filter Options</Text>
              <AntDesign name="close" size={24} color="black" onPress={toggleModal} />
            </View>

            <TextInput
              style={[
                styles.input,
                errorFields.fromLocation && styles.inputError,
              ]}
              placeholder="From Location"
              value={modalValues.fromLocation}
              onPress={() => {
                setFromLocationModal(true);
                setModalValues(prevValues => ({
                  ...prevValues,
                  fromLocation: ""
                }));
              }}
            />


            <View style={{ width: "auto", marginBottom: 5 }}>
              <SectionedMultiSelect
                items={userToLocationStatesData}
                IconRenderer={Icon}
                uniqueKey="id"
                searchPlaceholderText="Search state"
                selectedText="selected"
                selectText="To Location"
                confirmText="Done"
                onSelectedItemsChange={handleSelectStates}  // Call to update selected items
                selectedItems={selectedStates}  // Initialize with current user states
                styles={{
                  backdrop: styles.multiSelectBackdrop,
                  selectToggle: styles.multiSelectBox,
                  chipContainer: styles.multiSelectChipContainer,
                  chipText: styles.multiSelectChipText,
                  selectToggleText: styles.selectToggleText,
                  selectedItemText: styles.selectedItemText,
                  selectText: styles.selectText,
                  button: { backgroundColor: '#CE093A' },
                }}
              />
            </View>

            <View style={{ borderColor: "#ccc", borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
              <RNPickerSelect
                onValueChange={(value) => setModalValues({ ...modalValues, truckName: value })}
                items={brandData}
                value={modalValues.truckName}
                placeholder={{
                  label: 'Select brand name',
                  value: null,
                  color: 'grey',
                }}
              />
            </View>


            <View style={{ borderColor: "#ccc", borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
              <RNPickerSelect
                onValueChange={(value) => setModalValues({ ...modalValues, truckBodyType: value })}
                items={bodyTypeData}
                value={modalValues.truckBodyType}
                placeholder={{
                  label: 'Select truck body type',
                  value: null,
                  color: 'grey',
                }}
              />
            </View>

            <View style={{ borderColor: "#ccc", borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
              <RNPickerSelect
                onValueChange={(value) => setModalValues({ ...modalValues, noOfTyres: value })}
                items={numberOfTyresData}
                value={modalValues.noOfTyres}
                placeholder={{
                  label: 'Select number of tyres',
                  value: null,
                  color: 'grey',
                }}
              />
            </View>

            {/* <TextInput
              style={[styles.input, errorFields.tons && styles.inputError]}
              placeholder="Example: 2 tones"
              keyboardType="number-pad"
              value={modalValues.tons}
              onChangeText={(text) => handleInputChange('tons', text)}
            /> */}
            <View style={{ borderColor: "#ccc", borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
              <RNPickerSelect
                onValueChange={(value) => setModalValues({ ...modalValues, tons: value })}
                items={tonsData}
                value={modalValues.tons}
                placeholder={{
                  label: 'Select ton',
                  value: null,
                  color: 'grey',
                }}
              />
            </View>


            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={[styles.applyButton, { width: "48%" }]} onPress={handleClearFilter}>
                <Text style={styles.applyButtonText}>Clear filter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.applyButton, { width: "48%", backgroundColor: "green" }]} onPress={applyFilter}>
                <Text style={styles.applyButtonText}>Apply filter</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* Aadhaar verify Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAadhaarModal}
        onRequestClose={() => setIsAadhaarModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Aadhaar Verication</Text>
            <TextInput
              style={[styles.input, errorFields.companyName && styles.inputError, { marginVertical: 30 }]}
              placeholder="Enter your 12 digit aadhaar"
              value={aadhaar}
              maxLength={12}
              keyboardType="number-pad"
              onChangeText={(text) => setAadhaar(text)}
            />
            {
              aadhaarError !== "" ?
                <Text style={{ color: 'red', marginBottom: 20 }}>{aadhaarError}</Text>
                :
                null
            }

            {
              showOTPInputBox ?
                <>
                  <AadhaarOTPVerification
                  />
                  <View style={{ alignItems: 'center', marginVertical: 20 }}>
                    <Text>Didn't receive the code ? </Text>
                    <TouchableOpacity disabled={timeLeft === null ? false : true}>
                      {
                        isLoading ?
                          <View style={{ marginTop: 15 }}>
                            <ActivityIndicator size="small" color={COLORS.primary} />
                          </View>
                          :
                          <Text
                            style={{ color: timeLeft === null ? "#4285F4" : '#ccc', fontWeight: 'bold', textDecorationLine: 'underline', marginTop: 10 }}
                            onPress={resendClick}
                            disabled={timeLeft === null ? false : true}
                          >
                            {""}Resend code
                          </Text>
                      }
                      <Text style={{ display: timeLeft === null ? "none" : "inline" }}>(in {timeLeft} seconds)</Text>
                    </TouchableOpacity>
                  </View>
                </>
                :
                null
            }


            {
              showOTPInputBox ?
                // OTP Verify
                // isLoading ?
                //   <TouchableOpacity disabled style={[styles.applyButton, { marginTop: 20, opacity: isLoading ? 0.5 : 1 }]} >
                //     <ActivityIndicator size="small" color={COLORS.white} />
                //   </TouchableOpacity>
                //   :
                //   <TouchableOpacity disabled={aadhaarOTP.length === 6 ? false : true} style={[styles.applyButton, { marginTop: 20, opacity: aadhaarOTP.length === 6 ? 1 : 0.5 }]} onPress={handleVerifyAadhaarOTP}>
                //     <Text style={styles.applyButtonText}>Verify</Text>
                //   </TouchableOpacity>

                <CustomButtonWithLoading
                  buttonText="Verify"
                  buttonStyle={[styles.applyButton, { marginTop: 20, opacity: aadhaarOTP.length === 6 ? 1 : 0.5, }]}
                  textStyle={styles.applyButtonText}
                  indicatorSize="small"
                  indicatorColor={COLORS.white}
                  onPress={() => handleVerifyAadhaarOTP("Verify")}
                  // disabled={timeLeft === null ? false : true}
                  isLoading={loadingKey === "Verify"}
                />
                :
                // Aadhaar submit

                <CustomButtonWithLoading
                  buttonText="Submit"
                  buttonStyle={[styles.applyButton, { marginTop: 20, opacity: loadingKey === "Submit" ? 0.5 : 1 }]}
                  textStyle={styles.applyButtonText}
                  indicatorSize="small"
                  indicatorColor={COLORS.white}
                  onPress={() => handleAadhaarSubmit("Submit")}
                  // disabled={timeLeft === null ? false : true}
                  isLoading={loadingKey === "Submit"}
                />


              // isLoading ?
              //   <TouchableOpacity disabled style={[styles.applyButton, { marginTop: 20, opacity: isLoading ? 0.5 : 1 }]}>
              //     <ActivityIndicator size="small" color={COLORS.white} />
              //   </TouchableOpacity>

              //   :
              //   <TouchableOpacity style={[styles.applyButton, { marginTop: 20 }]} onPress={handleAadhaarSubmit}>
              //     <Text style={styles.applyButtonText}>Submit</Text>
              //   </TouchableOpacity>


            }
            <TouchableOpacity style={styles.closeButton} onPress={() => handleClose()}>
              <Text style={styles.applyButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/*From Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={fromLocationModal}
      >
        <View style={styles.locationModalContainer}>
          <View style={styles.locationModalContent}>
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

      {/*To Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={toLocationModal}
      >
        <View style={styles.locationModalContainer}>
          <View style={styles.locationModalContent}>
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
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginTop: 10,
  },
  ActivityIndicatorContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: "#e8f4ff",
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
    width: "80%",
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    padding: 12
  },
  inputError: {
    borderColor: "red",
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  applyButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#8a1c33",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  locationModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    height: "90%"
  },
  locationModalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    width: "80%",
    borderRadius: 10,
    elevation: 5,
    height: "90%"
  },
  locationContainer: {
    flex: 1,
    padding: 5,
  },
  locationTextInput: {
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  multiSelectBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
  },
  multiSelectBox: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'grey',
    padding: 10,
    paddingLeft: 15,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12

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

export default AvailableTruck;
