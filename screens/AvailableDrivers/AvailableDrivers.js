import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Linking,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import HeaderWithOutBS from "../../components/HeaderWithOutBS";
import SearchFilter from "../../components/SearchFilter";
import CustomButton from "../../components/CustomButton";
import DriverDetails from "./DriverDetails";
import axiosInstance from "../../services/axiosInstance";
import { LoadNeedsContext } from "../../hooks/LoadNeedsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import RNPickerSelect from 'react-native-picker-select';
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Alert } from "react-native";
import SendMessageModal from "../SendMessageModal";
import Constants from 'expo-constants'
import AntDesign from '@expo/vector-icons/AntDesign';
import CustomButtonWithLoading from "../../components/CustomButtonWithLoading";


import { MultiSelect } from "react-native-element-dropdown";
import { statesData } from "../../constants/cityAndState";
import Checkbox from "expo-checkbox";




const AvailableDrivers = ({ navigation }) => {


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
  const [driversData, setDriversData] = useState([]);
  const [isLoadings, setisLoadings] = useState(true);


  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAadhaarModal, setIsAadhaarModal] = useState(false)

  const [modalValues, setModalValues] = useState({
    driverName: "",
    fromLocation: "",
    toLocation: "",
    vehicleNumber: "",
    noOfTyres: "",
    truckBodyType: "",
    truckName: "",
  });
  const [errorFields, setErrorFields] = useState({
    driverName: false,
    fromLocation: false,
    toLocation: false,
    vehicleNumber: false,
    noOfTyres: false,
    truckBodyType: false,
    truckName: false,
  });
  const [aadhaar, setAadhaar] = useState("")
  const [aadhaarError, setAadhaarError] = useState("")
  const [showOTPInputBox, setShowOTPInputBox] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null);

  const [fromLocationModal, setFromLocationModal] = useState(false)
  const [toLocationModal, setToLocationModal] = useState(false)

  const [sendMessageModal, setSendMessageModal] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const [loadingKey, setLoadingKey] = useState(null); // Single loading state


  const [selectedToLocationModalStates, setSelectedToLocationModalStates] = useState([]);
  const [selectAllToLocationModalStates, setSelectAllToLocationModalStates] = useState(false);

  const [showingData, setShowingData] = useState([]);
  const [showingDataLoading, setShowingDataLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dataLimit, setDataLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0)
  const [isFiltered, setIsFiltered] = useState(false);
  const [applyFilterPagination, setApplyFilterPagination] = useState(false)


  const filterModalToLocationStatesData = statesData.map(state => (
    { label: state.name, value: state.name })
  );


  const handleFilterStates = (values) => {
    setSelectedToLocationModalStates(values);
  };

  const toggleSelectAll = () => {
    if (selectAllToLocationModalStates) {
      setSelectedToLocationModalStates([]); // Deselect all
    } else {
      setSelectedToLocationModalStates(statesData.map((item) => item.name)); // Select all states
    }
    setSelectAllToLocationModalStates(!selectAllToLocationModalStates);
  };





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
          navigation.navigate("DriverNeeds");
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


  const handleSearch = async (query) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page on new search
    await getAllDrivers(query ? query : search, 1, dataLimit); // Fetch data with page reset
  };






  // ✅ Prevent `getAllLoads` from running when filters are applied
  useEffect(() => {
    if (!isFiltered && !applyFilterPagination) {
      let delaySearch = setTimeout(() => {
        getAllDrivers(searchQuery ? searchQuery : search, page, dataLimit);
      }, search ? 500 : 0);

      return () => clearTimeout(delaySearch);
    }
  }, [search, page, dataLimit]);


  const getAllDrivers = async (searchVal, pageNo, limit) => {

    if (isFiltered) return

    try {
      setShowingDataLoading(true);

      const payload = {
        page_no: pageNo,
        data_limit: limit,
        search_val: searchVal,
      };


      const response = await axiosInstance.post("/all_driver_details", payload);



      if (response.data.error_code === 0) {


        const totalCount = response.data.data.all_record_count;

        setTotalRecords(Number(totalCount));

        const transformedData = response.data.data.result_data.map((item) => ({
          companyName: item.company_name,
          updatedTime: item.updt,
          post: item.user_post,
          profileName: item.profile_name,
          title: item.driver_name,
          fromLocation: item.from_location,
          toLocation: item.to_location,
          isAadhaarVerified: item.aadhaar_verified,
          labels: [
            { icon: "layers", text: item.vehicle_number },
            { icon: "attractions", text: `${item.no_of_tyres} wheels` },
            { icon: "local-shipping", text: item.truck_body_type },
            { icon: "person", text: item.driver_name },
          ],
          description: item.description,
          onButton1Press: () => Linking.openURL(`tel:${item.contact_no}`),
          onButton2Press: () => {
            setMessageReceiver(item)
            setSendMessageModal(true)
          }
        }));
        if (searchVal === "" && pageNo === 1 && limit === 10) {
          setSearchQuery("")
          setPage(1)
          setDataLimit(10)
        }



        setisLoadings(false);
        setShowingData(transformedData);
        setDriversData(transformedData);

      }
    } catch (error) {
      console.error("Error fetching loads:", error);
    } finally {
      setisLoadings(false);
      setShowingDataLoading(false);
    }
  };



  // const filteredTrucks = driversData.filter(
  //   (truck) =>
  //     truck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     truck.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     truck.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     truck.toLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     truck.labels[0].text.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     truck.labels[1].text.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     truck.labels[2].text.toLowerCase().includes(searchQuery.toLowerCase())
  //   // truck.labels[3].text.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
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



  const applyFilter = async (value, pageNo, limit) => {

    setIsFiltered(true); // Enable filtered mode immediately

    // Wait for state update before continuing
    await new Promise((resolve) => setTimeout(resolve, 0));

    const filterParams = {
      "driver_name": modalValues.driverName,
      "contact_no": "",
      "vehicle_number": "",
      "company_name": "",
      "from_location": modalValues.fromLocation,
      "to_location": selectedToLocationModalStates,
      "truck_body_type": modalValues.truckBodyType !== "" && modalValues.truckBodyType !== undefined && modalValues.truckBodyType !== null ? modalValues.truckBodyType : "",
      "truck_name": modalValues.truckName !== "" && modalValues.truckName !== undefined && modalValues.truckName !== null ? modalValues.truckName : "",
      "no_of_tyres": modalValues.noOfTyres !== "" && modalValues.noOfTyres !== undefined && modalValues.noOfTyres !== null ? modalValues.noOfTyres : "",
      page_no: pageNo, // Reset to first page when filtering
      data_limit: limit


    }



    try {
      if (isModalVisible) {
        setIsModalVisible(false)

      }


      // setPage(1); // ✅ Reset to first page
      setPageLoading(true);
      setShowingData([]);



      const response = await axiosInstance.post("/user_driver_details_filter", filterParams)
      if (response.data.error_code === 0) {
        setApplyFilterPagination(true)


        const totalCount = response.data.data.length || 0;
        setTotalRecords(Number(totalCount));

        const transformedData = response.data.data.map((item) => ({
          companyName: item.company_name,
          updatedTime: item.updt,
          post: item.user_post,
          profileName: item.profile_name,
          title: item.driver_name,
          fromLocation: item.from_location,
          toLocation: item.to_location,
          isAadhaarVerified: item.aadhaar_verified,
          labels: [
            { icon: "layers", text: item.vehicle_number },
            { icon: "attractions", text: `${item.no_of_tyres} wheels` },
            { icon: "local-shipping", text: item.truck_body_type },
            { icon: "person", text: item.driver_name },
          ],
          description: item.description,
          onButton1Press: () => Linking.openURL(`tel:${item.contact_no}`),
          onButton2Press: () => {
            setMessageReceiver(item)
            setSendMessageModal(true)
          }
        }));
        setShowingData(transformedData);
        setDriversData(transformedData);

      } else {
        console.error(
          "Error fetching all loads:",
          response.data.error_message
        );
        setShowingData([]);
        setTotalRecords(0); // ✅ Set totalRecords to 0 if no results found
        setPageLoading(false)

      }

    } catch (err) {
      console.log("Filter Error", err);
    } finally {
      setPageLoading(false);

      // ✅ Reset `isFiltered` only after updating totalRecords and showingData
      setTimeout(() => setIsFiltered(false), 500);
    }

  };


  const handleClearFilter = async () => {

    setIsLoading(true);
    setIsFiltered(false); // Exit filtered mode
    setIsModalVisible(false);

    setApplyFilterPagination(false); // Allow `getAllLoads` to be called again

    // Reset modal values and error fields when modal opens/closes
    setModalValues({
      driverName: "",
      fromLocation: "",
      toLocation: "",
      vehicleNumber: "",
      noOfTyres: "",
      truckBodyType: "",
      truckName: "",
    });

    setErrorFields({
      driverName: false,
      fromLocation: false,
      toLocation: false,
      vehicleNumber: false,
      noOfTyres: false,
      truckBodyType: false,
      truckName: false,
    });

    setSelectedToLocationModalStates([])
    setSelectAllToLocationModalStates(false)


    // Reset pagination
    setPage(1);

    try {
      // Fetch default loads
      await getAllDrivers("", 1, 10);

      // Reset UI state after clearing filters
      setSelectedToLocationModalStates([]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }


  }



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
        <HeaderWithOutBS title="Available Drivers" />
        <View style={styles.container}>
          <CustomButton
            title="Post Driver Details"
            onPress={navigateToSellYourTruck}
            backgroundColor="#8a1c33"
            textColor="white"
          />
          <CustomButton
            title="Filter"
            backgroundColor="#8a1c33"
            onPress={toggleModal}
            textColor="white"
          />
        </View>
        <SearchFilter handleClearFilter={handleClearFilter} setApplyFilterPagination={setApplyFilterPagination} getAllData={getAllDrivers} onSearch={handleSearch} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        {
          pageLoading === false ?
            <DriverDetails
              navigation={navigation}
              filteredTrucks={showingData}
              isMyPost={false}
              getAllData={getAllDrivers}
              handleClearFilter={handleClearFilter}
              showingData={showingData}
              setShowingData={setShowingData}
              showingDataLoading={showingDataLoading}
              setShowingDataLoading={setShowingDataLoading}
              totalRecords={totalRecords}
              search={search}
              setSearch={setSearch}
              page={page}
              setPage={setPage}
              dataLimit={dataLimit}
              setDataLimit={setDataLimit}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFiltered={isFiltered}
              applyFilter={applyFilter}
              applyFilterPagination={applyFilterPagination}
              setApplyFilterPagination={setApplyFilterPagination}
              availableDriversPage="true"

            />
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
            justifyContent: "center", // Centers the modal
            alignItems: "center", // Centers horizontally
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay
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
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  Filter Options
                </Text>
                <AntDesign name="close" size={24} color="black" onPress={() => {
                  setSelectedToLocationModalStates([])
                  toggleModal()
                }} />
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
              {/* 
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
              </View> */}


              <View style={{ marginBottom: 10 }}>

                {/* Show dropdown only if not all states are selected */}
                {!selectAllToLocationModalStates && (
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
                    data={filterModalToLocationStatesData} // Use actual states data
                    labelField="label" // Ensure correct field names
                    valueField="value"
                    placeholder={selectedToLocationModalStates.length ? `${selectedToLocationModalStates.length} states selected` : "To Location"}
                    value={selectedToLocationModalStates}
                    onChange={handleFilterStates}
                    placeholderStyle={{ fontSize: 16 }}
                  />
                )}

                {
                  selectAllToLocationModalStates &&
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
                    <Checkbox value={selectAllToLocationModalStates} onValueChange={toggleSelectAll} />
                    <Text style={{ marginLeft: 8 }}>Select All States</Text>
                  </TouchableOpacity>
                </View>

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

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                <TouchableOpacity
                  style={[styles.applyButton, { width: "48%" }]}
                  onPress={handleClearFilter}
                >
                  <Text style={styles.applyButtonText}>Clear filter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.applyButton, { width: "48%", backgroundColor: "green" }]}
                  onPress={() => applyFilter("", page, dataLimit)}
                >
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
    padding: 13
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
  closeButton: {
    backgroundColor: "#8a1c33",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  applyButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
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

export default AvailableDrivers;
