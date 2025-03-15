import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, View, Modal, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, Linking, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import HeaderWithOutBS from "../../components/HeaderWithOutBS";
import SearchFilter from "../../components/SearchFilter";
import CustomButton from "../../components/CustomButton";
import LoadDetails from "./LoadDetails";
import axiosInstance from "../../services/axiosInstance";
import { LoadNeedsContext } from "../../hooks/LoadNeedsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Container, { Toast } from 'toastify-react-native';
import AadhaarOTPVerification from "../AadhaarOTPVerification";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import RNPickerSelect from 'react-native-picker-select';
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { MaterialIcons as Icon } from '@expo/vector-icons';
import SendMessageModal from "../SendMessageModal";
import Constants from 'expo-constants'
import AntDesign from '@expo/vector-icons/AntDesign';
import CustomButtonWithLoading from "../../components/CustomButtonWithLoading";

import { MultiSelect } from "react-native-element-dropdown";
import { statesData } from "../../constants/cityAndState";
import PaginationComponent from "../PaginationComponent";




const AvailableLoads = ({ navigation }) => {

  // google api key
  const googleApiKey = Constants.expoConfig?.extra?.REACT_APP_GOOGLE_PLACES_KEY


  const {
    isLoading,
    setIsLoading,
    aadhaarOTP,
    setMessageReceiver,
    userStatesFromProfile,
  } = useContext(LoadNeedsContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [allLoadData, setAllLoadData] = useState([]);
  const [isLoadings, setisLoadings] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAadhaarModal, setIsAadhaarModal] = useState(false)
  const [modalValues, setModalValues] = useState({
    companyName: "",
    fromLocation: "",
    toLocation: "",
    material: "",
    noOfTyres: "",
    tons: "",
    truckBodyType: ""
  });
  const [errorFields, setErrorFields] = useState({
    companyName: false,
    fromLocation: false,
    toLocation: false,
    material: false,
    noOfTyres: false,
    tons: false,
    truckBodyType: false
  });
  const [isChecked, setIsChecked] = useState(false)
  const [aadhaar, setAadhaar] = useState("")
  const [aadhaarError, setAadhaarError] = useState("")
  const [showOTPInputBox, setShowOTPInputBox] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null);

  const [fromLocationModal, setFromLocationModal] = useState(false)
  const [toLocationModal, setToLocationModal] = useState(false)

  const [selectedStates, setSelectedStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([])
  const [userToLocationStatesData, setUserToLocationStatesData] = useState({})

  const [sendMessageModal, setSendMessageModal] = useState(false)
  const [doNotAskModal, setDoNotAskModalModal] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const [loadingKey, setLoadingKey] = useState(null); // Single loading state

  const [selectedFilterStates, setSelectedFilterStates] = useState([]);

  const [showingData, setShowingData] = useState([]);
  const [showingDataLoading, setShowingDataLoading] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dataLimit, setDataLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0)
  const [isFiltered, setIsFiltered] = useState(false);




  const data = [
    { label: "Select All", value: "select_all" },
    ...statesData.map(state => ({ label: state.name, value: state.name }))
  ];


  const handleFilterStates = (values) => {
    if (values.includes("select_all")) {
      // Select all or deselect all logic
      setSelectedFilterStates(
        selectedFilterStates.length === statesData.length
          ? []
          : statesData.map(item => item.name) // Ensure correct field name
      );
    } else {
      // Remove "select_all" if selected and update selected states
      setSelectedFilterStates(values.filter(v => v !== "select_all"));
    }
  };


  const handleFindLoadStates = (values) => {
    if (values.includes("select_all")) {
      setSelectedStates(
        selectedStates.length === statesData.length
          ? [] // Deselect all if already selected
          : statesData.map(item => item.name) // Ensure correct property name
      );
    } else {
      setSelectedStates(values.filter(v => v !== "select_all"));
    }
  };



  useEffect(() => {
    setUserToLocationStatesData(
      userStatesFromProfile.map((state, index) => ({
        id: index + 1,
        name: state
      }))
    )
  }, [])

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

  const navigateToSellYourTruck = async () => {
    try {
      const isAadhaarVerifiedParams = {
        user_id: `${await AsyncStorage.getItem("user_id")}`
      }
      const response = await axiosInstance.post("/check_aadhar_verification", isAadhaarVerifiedParams)
      if (response.data.error_code === 0) {
        if (response.data.data.is_aadhar_verified === true) {
          setModalValues({
            companyName: "",
            fromLocation: "",
            toLocation: "",
            material: "",
            noOfTyres: "",
            tons: "",
            truckBodyType: ""
          });
          setSelectedStates([])
          navigation.navigate("LoadNeeds");
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




  console.log("query", searchQuery)

  useEffect(() => {
    setTimeout(() => {
      setDoNotAskModalModal(true)
    }, (200));
  }, [])


  useEffect(() => {
    if (!isFiltered) { // Only fetch when not filtered
      let delaySearch;
      if (search) {
        delaySearch = setTimeout(() => {
          getAllLoads(search, page, dataLimit);
        }, 500);
      } else {
        getAllLoads(search, page, dataLimit);
      }

      return () => clearTimeout(delaySearch);
    }
  }, [search, isFiltered]); // Add isFiltered to dependency array

  useEffect(() => {
    if (!isFiltered) { // Prevent fetching all loads when filtered
      getAllLoads(search, page, dataLimit);
    }
  }, [page, dataLimit, isFiltered]); // Add isFiltered to dependency array

  const getAllLoads = async (searchVal, pageNo, limit) => {

    try {
      if (isFiltered) return; // Prevent fetching if filtered data is displayed

      setShowingDataLoading(true);

      const payload = {
        page_no: pageNo,
        data_limit: limit,
        search_val: searchVal
      };
      const response = await axiosInstance.post("/all_load_details", payload);



      if (response.data.error_code === 0) {
        const totalCount = response.data.data.all_record_count;

        setTotalRecords(Number(totalCount));

        console.log("response.data.data",response.data)


        const transformedData = response.data.data.load_data.map((item) => ({
          companyName: item.company_name,
          updatedTime: item.updt,
          post: item.user_post,
          profileName: item.profile_name,
          title: item.company_name,
          fromLocation: item.from_location,
          toLocation: item.to_location,
          isAadhaarVerified: item.aadhaar_verified,
          labels: [
            { icon: "table-view", text: item.material },
            { icon: "attractions", text: `${item.no_of_tyres} wheels` },
            { icon: "monitor-weight", text: `${item.tone} tons` },
            { icon: "local-shipping", text: item.truck_body_type },
          ],
          description: item.description,
          onButton1Press: () => Linking.openURL(`tel:${item.contact_no}`),
          onButton2Press: () => {
            setMessageReceiver(item);
            setSendMessageModal(true);
          }
        }));
        if (searchVal === "" && pageNo === 1 && limit === 10) {
          setSearchQuery("")
          setPage(1)
          setDataLimit(10)
        }

        setShowingData(transformedData);
        setAllLoadData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching loads:", error);
    } finally {
      setisLoadings(false);
      setShowingDataLoading(false);
    }
  };





  const filteredTrucks = allLoadData.filter(
    (truck) =>
      truck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.profileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.toLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.labels[0].text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.labels[1].text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.labels[2].text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.labels[3].text.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleClearFilter = async () => {
    setIsLoading(true);
    setIsFiltered(false); // Exit filtered mode

    // Reset filter values
    setModalValues({
      companyName: "",
      fromLocation: "",
      toLocation: "",
      material: "",
      noOfTyres: "",
      tons: "",
      truckBodyType: ""
    });

    setSelectedStates([]);

    setErrorFields({
      companyName: false,
      fromLocation: false,
      toLocation: false,
      material: false,
      noOfTyres: false,
      tons: false,
      truckBodyType: false
    });

    // Reset pagination
    setPage(1);

    try {
      // Wait for data to load before closing the modal
      await getAllLoads("", 1, 10);

      // Now close the modal only after data is fetched
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };



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



    setModalValues({
      ...modalValues, fromLocation: (`${city}, ${state}`)
    })
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


    setModalValues({
      ...modalValues, toLocation: (`${city}, ${state}`)
    })
    setToLocationModal(false)
  };



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



  const applyFilter = async (value) => {
    setIsFiltered(true); // Enable filtered mode immediately

    // Wait for state update before continuing
    await new Promise((resolve) => setTimeout(resolve, 0));

    const filterParams = {
      company_name: "",
      from_location: modalValues.fromLocation,
      material: modalValues.material,
      no_of_tyres: modalValues.noOfTyres || "",
      to_location: selectedFilterStates,
      tone: modalValues.tons || "",
      truck_body_type: modalValues.truckBodyType || "",
      user_id: "",
      page_no: "0",
      data_limit: "10"
    };

    try {
      if (value !== "initialModal") {
        toggleModal();
      }

      setPageLoading(true);
      setShowingData([]);

      const response = await axiosInstance.post("/user_load_details_filter", filterParams);

      console.log("Filtered length", response.data.data.result_data.length);

      if (response.data.error_code === 0) {
        const totalCount = response.data.data.all_record_count;
        setTotalRecords(Number(totalCount));
        const transformedData = response.data.data.result_data.map((item) => ({
          companyName: item.company_name,
          updatedTime: item.updt,
          post: item.user_post,
          profileName: item.profile_name,
          title: item.company_name,
          fromLocation: item.from_location,
          toLocation: item.to_location,
          isAadhaarVerified: item.aadhaar_verified,
          labels: [
            { icon: "table-view", text: item.material },
            { icon: "attractions", text: `${item.no_of_tyres} wheels` },
            { icon: "monitor-weight", text: `${item.tone} tons` },
            { icon: "local-shipping", text: item.truck_body_type },
          ],
          description: item.description,
          onButton1Press: () => Linking.openURL(`tel:${item.contact_no}`),
          onButton2Press: () => {
            setMessageReceiver(item);
            setSendMessageModal(true);
          }
        }));

        setShowingData(transformedData);
        setAllLoadData(transformedData);
      } else {
        setShowingData([]);
      }
    } catch (err) {
      console.log("Filter Error", err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleClose = () => {
    setShowOTPInputBox(false)
    setIsAadhaarModal(false)
  }

  if (isLoadings) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }


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


  const handleYes = () => {
    setSendMessageModal(false);
    navigation.navigate("Chat")
  };

  const handleCancel = () => {
    setSendMessageModal(false);
  };

  const handleFind = () => {
    applyFilter("initialModal")
    setDoNotAskModalModal(false)
  }

  const handleCheckBox = () => {
    setIsChecked(!isChecked)
  }



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e8f4ff" }}>

      <Container
        position="top"
        duration={3000}
        animationIn="slideInDown"
        height="auto"
        width="100%"
        textStyle={{
          fontSize: 15,
          flexWrap: 'wrap', // Ensure text wraps
          maxWidth: '90%', // Ensure text does not overflow
          overflow: 'hidden',
        }} // Ensure text wraps
      />
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <HeaderWithOutBS title="Available Loads" />
        <View style={styles.container}>
          <CustomButton
            title="Post Load Needs"
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
        <SearchFilter onSearch={handleSearch} searchQuery={searchQuery} />
        {
          pageLoading == false ?
            <>
              <LoadDetails
                isMyPost={false}
                getAllData={getAllLoads}
                showingData={filteredTrucks}
                setShowingData={setShowingData}
                showingDataLoading={showingDataLoading}
                setShowingDataLoading={setShowingDataLoading}
                navigation={navigation}
                filteredTrucks={filteredTrucks}
                totalRecords={totalRecords}
                search={search}
                setSearch={setSearch}
                page={page}
                setPage={setPage}
                dataLimit={dataLimit}
                setDataLimit={setDataLimit}
              />

            </>
            :
            <View style={styles.ActivityIndicatorContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        }
      </View>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center", // Center vertically
            alignItems: "center", // Center horizontally
            backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              width: "80%", // Adjust modal width
              borderRadius: 10,
              padding: 20,
              maxHeight: "80%", // Restrict height for scrolling
            }}
          >
            <ScrollView
              style={{ maxHeight: "100%", width: "100%" }} // Ensure full width
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                  Filter Options
                </Text>
                <AntDesign
                  name="close"
                  size={24}
                  color="black"
                  onPress={() => {
                    setSelectedFilterStates([])
                    toggleModal()
                  }} />
              </View>

              <TextInput
                style={{
                  borderColor: "#ccc",
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 5,
                  marginBottom: 10,
                  fontSize: 16
                }}
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

              <View style={{ marginBottom: 10 }}>
                <MultiSelect
                  style={{ borderColor: "#ccc", borderWidth: 1, padding: 12, borderRadius: 5 }}
                  data={data}
                  labelField="label"
                  valueField="value"
                  placeholder="To Location"
                  value={selectedFilterStates}
                  onChange={handleFilterStates}
                  placeholderStyle={{ fontSize: 16 }}
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

              <TextInput
                style={{
                  borderColor: "#ccc",
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 5,
                  marginBottom: 10,
                }}
                placeholder="Material"
                value={modalValues.material}
                onChangeText={(text) => handleInputChange('material', text)}
              />

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
            </ScrollView>
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

      {/* Find loads Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={doNotAskModal}
        onRequestClose={() => setDoNotAskModalModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center', // Centers modal vertically
          alignItems: 'center', // Centers modal horizontally
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adds overlay effect
        }}>
          <View style={{
            backgroundColor: 'white',
            width: '90%', // Adjust width as needed
            borderRadius: 10,
            padding: 20,
            maxHeight: "80%", // Ensures it doesn't take full screen
          }}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  flex: 1,
                }}>Find Loads</Text>
                <AntDesign
                  onPress={() => setDoNotAskModalModal(false)}
                  name="close"
                  size={25}
                  color="black"
                />
              </View>

              <TextInput
                style={[styles.input, errorFields.fromLocation && styles.inputError]}
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

              <View style={{ marginBottom: 10 }}>
                <MultiSelect
                  style={{ borderColor: "#ccc", borderWidth: 1, padding: 12, borderRadius: 5 }}
                  data={data}
                  labelField="label"
                  valueField="value"
                  placeholder="To Location"
                  value={selectedStates}
                  onChange={handleFindLoadStates}
                  placeholderStyle={{ fontSize: 16 }}
                />
              </View>

              <View style={{ marginTop: 20, alignItems: 'center' }}>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton, { width: "100%" }]}
                  onPress={handleFind}
                >
                  <Text style={[styles.buttonText, { textAlign: "center" }]}>Find</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>



    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    backgroundColor: "#e8f4ff",
    justifyContent: "center",
    alignItems: "center",
  },
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",

  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: "80%",
    maxHeight: "50%"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    textAlignVertical: 'center'
  },
  modalText: {
    fontSize: 15,
    marginTop: 10,
    textAlign: "center",
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    padding: 12,

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
    height: "90%",
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
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    alignItems: 'center',
    marginHorizontal: 20

  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: "#999",
    width: "50%",

  },
  button: {
    backgroundColor: "#0066cc",
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 20,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },

});

export default AvailableLoads;
