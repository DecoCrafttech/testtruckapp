import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import HeaderWithOutBS from "../../components/HeaderWithOutBS";
import MarketPlaceProducts from "./MarketPlaceProducts";
import SearchFilter from "../../components/SearchFilter";
import CustomButton from "../../components/CustomButton";
import { LoadNeedsContext } from "../../hooks/LoadNeedsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../services/axiosInstance";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import AadhaarOTPVerification from "../AadhaarOTPVerification";
import Toast from "react-native-toast-message";
import RNPickerSelect from 'react-native-picker-select';
import Constants from 'expo-constants'
import { statesData } from "../../constants/cityAndState";
import { AntDesign, MaterialIcons as Icon } from '@expo/vector-icons';
import CustomButtonWithLoading from "../../components/CustomButtonWithLoading";
import { MultiSelect } from "react-native-element-dropdown";



const MarketPlace = ({ navigation }) => {


  // google api key
  const googleApiKey = Constants.expoConfig?.extra?.REACT_APP_GOOGLE_PLACES_KEY

  const [loading, setLoading] = useState(true);
  const [loadingKey, setLoadingKey] = useState(null); // Single loading state


  const {
    isLoading,
    setIsLoading,
    aadhaarOTP,
  } = useContext(LoadNeedsContext)

  const [searchQuery, setSearchQuery] = useState("");
  const [allBuyAndSellData, setAllBuyAndSellData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAadhaarModal, setIsAadhaarModal] = useState(false)
  const [modalValues, setModalValues] = useState({
    brand: "",
    price: "",
    kmsDriven: "",
    model: "",
    location: "",
    ton: "",
    noOfTyres: "",
    truckBodyType: ""
  });
  const [errorFields, setErrorFields] = useState({
    brand: false,
    price: false,
    kmsDriven: false,
    model: false,
    location: false,
    ton: false
  });

  const [truckBodyType, setTruckBodyType] = useState("");
  const [numberOfTyres, setNumberOfTyres] = useState("");
  const [aadhaar, setAadhaar] = useState("")
  const [aadhaarError, setAadhaarError] = useState("")
  const [showOTPInputBox, setShowOTPInputBox] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null);

  const [locationModal, setLocationModal] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)

  const [selectedFilterStates, setSelectedFilterStates] = useState([]);



  const [showingData, setShowingData] = useState([]);
  const [showingDataLoading, setShowingDataLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dataLimit, setDataLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0)
  const [isFiltered, setIsFiltered] = useState(false);
  const [applyFilterPagination, setApplyFilterPagination] = useState(false)




  const data = [
    { label: "Select All", value: "select_all" },
    ...statesData.map(state => ({ label: state.name, value: state.id.toString() }))
  ];

  const handleFilterStates = (values) => {
    if (values.includes("select_all")) {
      setSelectedFilterStates(selectedFilterStates.length === data.length - 1 ? [] : data.map(item => item.value).filter(v => v !== "select_all"));
    } else {
      setSelectedFilterStates(values.filter(v => v !== "select_all"));
    }
  };


  // ✅ Prevent `getAllLoads` from running when filters are applied
  useEffect(() => {
    if (!isFiltered && !applyFilterPagination) {
      let delaySearch = setTimeout(() => {
        getAllBuyAndSellData(searchQuery ? searchQuery : search, page, dataLimit);
      }, search ? 500 : 0);

      return () => clearTimeout(delaySearch);
    }
  }, [search, page, dataLimit]);




  const getAllBuyAndSellData = async (searchVal, pageNo, limit) => {

    if (isFiltered) return


    try {
      setShowingDataLoading(true);

      const payload = {
        page_no: pageNo,
        data_limit: limit,
        search_val: searchVal,
      };


      setPageLoading(true)
      const response = await axiosInstance.post("/all_buy_sell_details", payload);


      if (response.data.error_code === 0) {
        const totalCount = response.data.data.all_record_count;

        setTotalRecords(Number(totalCount));

        setAllBuyAndSellData(response.data.data.result_data);
        setPageLoading(false)
        setShowingData(response.data.data.result_data);
      } else {
        setPageLoading(false)
      }
    } catch (error) {
      console.log(error);
      setPageLoading(false)
    } finally {
      setLoading(false);
      setPageLoading(false)
      setShowingDataLoading(false);

    }
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
          navigation.navigate("SellYourTruck");
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


  const onPressCategory = (item) => {
    navigation.navigate("TruckDetails", { item });
  };

  // const filteredProducts = allBuyAndSellData.filter((product) =>
  //   product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   product.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   product.kms_driven.includes(searchQuery)
  // );



  const handleSearch = async (query) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page on new search
    await getAllBuyAndSellData(query ? query : search, 1, dataLimit); // Fetch data with page reset
  };



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

  const applyFilter = async (value, pageNo, limit) => {


    setIsFiltered(true); // Prevent getAllLoads from running

    await new Promise((resolve) => setTimeout(resolve, 0));

    const filterParams = {
      "user_id": "",
      "owner_name": "",
      "vehicle_number": "",
      "contact_no": "",
      "kms_driven": modalValues.kmsDriven !== "" && modalValues.kmsDriven !== undefined && modalValues.kmsDriven !== null ? modalValues.kmsDriven : "",
      "brand": modalValues.brand !== "" && modalValues.brand !== undefined && modalValues.brand !== null ? [`${modalValues.brand}`] : [],
      "model": modalValues.model !== "" && modalValues.model !== undefined && modalValues.model !== null ? `${modalValues.model}` : "",
      "location": modalValues.location !== "" && modalValues.location !== undefined && modalValues.location !== null ? [`${modalValues.location}`] : "",
      "price": modalValues.price !== "" && modalValues.price !== undefined && modalValues.price !== null ? modalValues.price : "",
      "tonnage": modalValues.ton !== "" && modalValues.ton !== undefined && modalValues.ton !== null ?  modalValues.ton : "",
      "truck_body_type": modalValues.truckBodyType !== "" && modalValues.truckBodyType !== undefined && modalValues.truckBodyType !== null ? modalValues.truckBodyType : "",
      "no_of_tyres": modalValues.noOfTyres !== "" && modalValues.noOfTyres !== undefined && modalValues.noOfTyres !== null ? modalValues.noOfTyres : "",
      "statelist": modalValues.location !== "" && modalValues.location !== undefined && modalValues.location !== null ? [`${modalValues.location}`] : "",
      "company_name": "",
      "search_val": "",
      page_no: pageNo, // Reset to first page when filtering
      data_limit: limit
    }

    console.log("filterParams",filterParams)


    try {

      if (isModalVisible) {
        setIsModalVisible(false)
      }


      // setPage(1); // ✅ Reset to first page
      setPageLoading(true);
      setShowingData([]);

      const response = await axiosInstance.post("/user_buy_sell_filter", filterParams)



      if (response.data.error_code === 0) {



        setApplyFilterPagination(true)
        const totalCount = response.data.data.all_record_count || 0;

        console.log("totalCount",totalCount)
        setTotalRecords(Number(totalCount)); // ✅ Update totalRecords correctly

        setAllBuyAndSellData(response.data.data.result_data)
        setPageLoading(false)
        setShowingData(response.data.data.result_data);



      } else {
        console.error(
          "Error fetching all loads:",
          response.data.error_message
        );
        setPageLoading(false)
        setShowingData([]);
        setTotalRecords(0); // ✅ Set totalRecords to 0 if no results found


      }

    } catch (err) {
      console.log("Filter Error", err);
    } finally {
      setPageLoading(false);

      // ✅ Reset `isFiltered` only after updating totalRecords and showingData
      setTimeout(() => setIsFiltered(false), 500);
    }

  };

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


    setModalValues({
      ...modalValues, location: (`${city}, ${state}`)
    })
    setLocationModal(false)
  };



  const handleClearFilter = async () => {
    setIsLoading(!isLoading);
    setIsFiltered(false); // Exit filtered mode
    setIsModalVisible(false);

    setApplyFilterPagination(false); // Allow `getAllLoads` to be called again

    // Reset filter values
    setModalValues({
      brand: "",
      price: "",
      kmsDriven: "",
      model: "",
      location: "",
      ton: "",
      noOfTyres: "",
      truckBodyType: ""
    });
    setTruckBodyType("")
    setNumberOfTyres("")
    setStatelist([])


    // Reset pagination
    setPage(1);

    try {
      // Fetch default loads
      await getAllBuyAndSellData("", 1, 10);

      // Reset UI state after clearing filters
      setSelectedFilterStates([]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }

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

  const kmsData = [
    { label: '0 - 10,000 kms', value: '(0 - 10,000) kms' },
    { label: '10,001 - 30,000 kms', value: '(10,001 - 30,000) kms' },
    { label: '30,001 - 50,000 kms', value: '(30,001 - 50,000) kms' },
    { label: '50,001 - 70,000 kms', value: '(50,001 - 70,000) kms' },
    { label: '70,001 - 100,000 kms', value: '(70,001 - 100,000) kms' },
    { label: '100,001 - 150,000 kms', value: '(100,001 - 150,000) kms' },
    { label: '150,001 - 200,000 kms', value: '(150,001 - 200,000) kms' },
    { label: '200,001 - 300,000 kms', value: '(200,001 - 300,000) kms' },
    { label: '300,001 - 500,000 kms', value: '(300,001 - 500,000) kms' },
    { label: '500,001 - 700,000 kms', value: '(500,001 - 700,000) kms' },
    { label: '700,001 - 1,000,000 kms', value: '(700,001 - 1,000,000) kms' },
    { label: '1,000,001 - 1,500,000 kms', value: '(1,000,001 - 1,500,000) kms' },
    { label: '1,500,001 - 2,000,000 kms', value: '(1,500,001 - 2,000,000) kms' },
    { label: '2,000,001+ kms', value: '(2,000,001+) kms' }
  ];


  const priceData = [
    { label: '0 - 5,00,000 lakhs', value: '(0 - 5,00,000) lakhs' },
    { label: '5,00,001 - 10,00,000 lakhs', value: '(5,00,001 - 10,00,000) lakhs' },
    { label: '10,00,001 - 20,00,000 lakhs', value: '(10,00,001 - 20,00,000) lakhs' },
    { label: '20,00,001 - 30,00,000 lakhs', value: '(20,00,001 - 30,00,000) lakhs' },
    { label: '30,00,001 - 40,00,000 lakhs', value: '(30,00,001 - 40,00,000) lakhs' },
    { label: '40,00,001 - 50,00,000 lakhs', value: '(40,00,001 - 50,00,000) lakhs' },
    { label: '50,00,001 - 60,00,000 lakhs', value: '(50,00,001 - 60,00,000) lakhs' },
    { label: '60,00,001 - 70,00,000 lakhs', value: '(60,00,001 - 70,00,000) lakhs' },
    { label: '70,00,001 - 80,00,000 lakhs', value: '(70,00,001 - 80,00,000) lakhs' },
    { label: '80,00,001 - 90,00,000 lakhs', value: '(80,00,001 - 90,00,000) lakhs' },
    { label: '90,00,001 and above lakhs', value: '(90,00,001 and above) lakhs' }
  ];



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
  const years = Array.from({ length: 45 }, (_, index) => {
    const year = currentYear - index;
    return {
      label: `${year}`,
      value: `${year}`,
    };
  });

  const yearsData1 = years


  const yearsData = [
    { label: "1980-1990", value: "1980-1990" },
    { label: "1991-2000", value: "1991-2000" },
    { label: "2001-2010", value: "2001-2010" },
    { label: "2011-2020", value: "2011-2020" },
    { label: "2021-Till now", value: "2021-Till now" },
  ]

  const tonsData = [
    { label: "1 Ton - 5 Ton", value: "1 Ton - 5 Ton" },
    { label: "6 Ton - 10 Ton", value: "6 Ton - 10 Ton" },
    { label: "11 Ton - 15 Ton", value: "11 Ton - 15 Ton" },
    { label: "16 Ton - 20 Ton", value: "16 Ton - 20 Ton" },
    { label: "Above 20 Ton", value: "Above 20 Ton" },
  ]



  const handleClose = () => {
    setShowOTPInputBox(false)
    setIsAadhaarModal(false)
  }

  const [editSelectedStates, setEditSelectedStates] = useState([])
  const [updateSelectedStates, setUpdateSelectedStates] = useState([])



  const handleEditStatesChange = async (selectedItemIds) => {
    // Log previously selected states
    const prevSelectedStateNames = editSelectedStates.map(id => {
      const state = statesData.find(state => state.id === id);
      return state ? state.name : null;
    }).filter(name => name !== null);


    // Update selected states
    setEditSelectedStates(selectedItemIds);

    // Log currently selected states
    const selectedStateNames = selectedItemIds.map(id => {
      const state = statesData.find(state => state.id === id);
      return state ? state.name : null;
    }).filter(name => name !== null);
    setUpdateSelectedStates(selectedStateNames)
  };


  const [open, setOpen] = useState(false); // Controls dropdown visibility
  const [statelist, setStatelist] = useState([]); // Stores selected items



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <HeaderWithOutBS title="Used Vehicle Sale" />
        <View style={styles.container}>
          <CustomButton
            title="Sell your Truck"
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
        <SearchFilter handleClearFilter={handleClearFilter} setApplyFilterPagination={setApplyFilterPagination} getAllData={getAllBuyAndSellData} onSearch={handleSearch} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        {
          pageLoading === false ?
            <MarketPlaceProducts
              navigation={navigation}
              onPressCategory={onPressCategory}
              filteredProducts={showingData}
              loading={loading}
              isMyPost={false}
              getAllData={getAllBuyAndSellData}
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


              <View style={{ borderColor: COLORS.gray, borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
                <RNPickerSelect
                  onValueChange={(value) => setModalValues({ ...modalValues, model: value })}
                  items={yearsData}
                  value={modalValues.model}
                  placeholder={{
                    label: 'Model',
                    value: null,
                    color: 'grey',
                  }}
                />
              </View>

              <View style={{ borderColor: COLORS.gray, borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
                <RNPickerSelect
                  onValueChange={(value) => setModalValues({ ...modalValues, brand: value })}
                  items={brandData}
                  value={modalValues.brand}
                  placeholder={{
                    label: 'Brand',
                    value: null,
                    color: 'grey',
                  }}
                />
              </View>

              <TextInput
                style={[styles.input, errorFields.location && styles.inputError, { fontSize: 16, borderColor: COLORS.gray, borderWidth: 1, paddingLeft: 17, borderRadius: 5, height: 55, marginBottom: 10 }]}
                placeholder="Search location"
                placeholderTextColor="#c2c2c2"
                value={modalValues.location}
                onPress={() => {
                  setLocationModal(true);
                }}
              />



              {/* <DropDownPicker
                open={open}
                value={statelist}
                items={statesData}
                setOpen={setOpen}
                setValue={setStatelist}
                setItems={setStatesData}
                multiple={true} // Enable multi-select
                min={0} // Minimum number of items to select
                max={5} // Maximum number of items to select
                placeholder="Select states"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              /> */}


              {/* <View style={{ marginBottom: 10 }}>
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
              </View> */}

              <View style={{ borderColor: COLORS.gray, borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
                <RNPickerSelect
                  onValueChange={(value) => setModalValues({ ...modalValues, ton: value })}
                  items={tonsData}
                  value={modalValues.ton}
                  placeholder={{
                    label: 'Select ton',
                    value: null,
                    color: 'grey',
                  }}
                />
              </View>

              <View style={{ borderColor: COLORS.gray, borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
                <RNPickerSelect
                  onValueChange={(value) => setModalValues({ ...modalValues, kmsDriven: value })}
                  items={kmsData}
                  value={modalValues.kmsDriven}
                  placeholder={{
                    label: 'KMS Driven',
                    value: null,
                    color: 'grey',
                  }}
                />
              </View>


              <View style={{ borderColor: COLORS.gray, borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
                <RNPickerSelect
                  onValueChange={(value) => {
                    setModalValues({ ...modalValues, price: value })
                  }}
                  items={priceData}
                  value={modalValues.price}
                  placeholder={{
                    label: 'Price',
                    color: 'grey',
                  }}
                />
              </View>

              <View style={{ borderColor: COLORS.gray, borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
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

              <View style={{ borderColor: COLORS.gray, borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
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

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={[styles.applyButton, { width: "48%" }]} onPress={handleClearFilter}>
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

      {/* Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={locationModal}
      >
        <View style={styles.locationModalContainer}>
          <View style={styles.locationModalContent}>
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

    </SafeAreaView >
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",

  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    width: "80%", // Adjust width as needed
    borderRadius: 10,
    elevation: 5,
    overflow: 'scroll',

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
    height: 40,
  },
  inputError: {
    borderColor: "red",
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    paddingHorizontal: 10
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
    paddingHorizontal: 10

  },
  closeIcon: {
    position: 'absolute',
    end: 20,
    top: 15
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
  },


  dropdown: {
    height: 60,  // Increase the height of the dropdown button
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 8, paddingLeft: 10,
    justifyContent: 'center',  // Ensure content is vertically centered
    marginBottom: 10,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 8,
    paddingTop: 10,  // Increase space for content
    paddingBottom: 10,  // Add padding for a larger dropdown
  },

});

export default MarketPlace;
