import React, { useState, useContext, useCallback } from "react";
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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Constants from 'expo-constants'
import { BackHandler } from "react-native";


const FeedbackAndComplaintForm = () => {

  // google api key
  const googleApiKey = Constants.expoConfig?.extra?.REACT_APP_GOOGLE_PLACES_KEY

  const navigate = useNavigation("")

  const { isLoading, setIsLoading } = useContext(LoadNeedsContext);

  const [spinner, setSpinner] = useState(false);
  const [addPostLoading, setAddPostLoading] = useState(false)


  const [customerName, setCustomerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("")
  const [entryType, setEntryType] = useState("")
  const [content, setContent] = useState("")



  // State variables to track input field validity


  const [customerNameValid, setCustomerNameValid] = useState(true);
  const [contactNumberValid, setContactNumberValid] = useState(true);
  const [categoryValid, setCategoryValid] = useState(true);
  const [emailValid, setEmailValid] = useState(true);
  const [entryTypeValid, setEntryTypeValid] = useState(true);
  const [contentValid, setContentValid] = useState(true);

  const entryTypes = [
    { label: "Complaint", value: "Complaint" },
    { label: "Feedback", value: "Feedback" },
  ]


  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', handleBackPress)
    })
  )

  const handleBackPress = () => {
    setCustomerName("");
    setContactNumber("");
    setCategory("")
    setEmail("");
    setEntryType("");
    setContent("");
    setCustomerNameValid(true);
    setContactNumberValid(true);
    setCategoryValid(true);
    setEmailValid(true);
    setContentValid(true);
    setEntryTypeValid(true);

  }

  const handleSubmit = async () => {

    // Check if any required field is empty
    if (
      customerName.trim() === "" ||
      contactNumber.trim() === "" ||
      category.trim() === "" ||
      email.trim() === "" ||
      entryType.trim() === "" ||
      content.trim() === ""
    ) {
      Alert.alert("Please fill in all the fields.");
      setCustomerNameValid(customerName.trim() !== "");
      setContactNumberValid(contactNumber.trim() !== "");
      setCategoryValid(category.trim() !== "");
      setEmailValid(email.trim() !== "");
      setContentValid(content.trim() !== "");
      setEntryTypeValid(content.trim() !== "");
      // setTruckBodyTypeValid(truckBodyType.trim() !== "");
      // setNumberOfTyresValid(numberOfTyres.trim() !== "");
      // setSpinner(false)
      return;
    }

    // Prepare data object to send in the API request
    const payload = {
      "customer_name": customerName,
      "category": category,
      "phone_no": contactNumber,
      "email_id": email,
      "entry_type": entryType,
      "content": content,
    };

    try {


      setSpinner(true);

      // Make API call using Axios instance (replace with your actual endpoint)
      const response = await axiosInstance.post("/feedback_complaints_entry ", payload);

      // Handle API response
      if (response.data.error_code === 0) {
        setIsLoading(!isLoading);
        Alert.alert("Complaint details updated successfully");
        navigate.goBack()
        setCustomerName("");
        setContactNumber("");
        setCategory("")
        setEmail("");
        setEntryType("");
        setContent("");
      } else {
        Alert.alert(response.data.message);
      }
    } catch (error) {
      console.error(response.data.message);
      Alert.alert(response.data.message);
    } finally {
      setSpinner(false); // Stop loading
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <HeaderWithOutBS title="Feedback and Complaint form" handleBackPress={handleBackPress} />

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.textInputContainer}>

            <Text style={styles.label}>Customer Name</Text>
            <TextInput
              style={[
                styles.textInput,
                !customerNameValid && { borderColor: "red" },
              ]}
              placeholder="Enter customer name"
              onChangeText={setCustomerName}
              value={customerName}
            />


            <Text style={styles.label}>Category</Text>
            <TextInput
              style={[
                styles.textInput,
                !categoryValid && { borderColor: "red" },
              ]}
              placeholder="Enter category"
              onChangeText={setCategory}
              value={category}
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

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.textInput,
                !emailValid && { borderColor: "red" },
              ]}
              placeholder="Enter your email"
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
            />

            <Text style={styles.label}>Entry type</Text>
            {/* <TextInput
              editable={false}
              style={[
                styles.textInput,
                !entryTypeValid && { borderColor: "red" },
              ]}
              onChangeText={setEntryType}
              value="Complaint"
            /> */}

            <View style={{ borderColor: COLORS.gray, borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10 }}>
              <RNPickerSelect
                onValueChange={(value) => setEntryType(value)}
                items={entryTypes}
                value={entryType}
                placeholder={{
                  label: 'Select entry type',
                  value: null,
                  color: 'grey',
                }}
              />
            </View>

            <Text style={styles.label}>Content</Text>
            <TextInput
              style={[
                styles.textInput,
                !contentValid && { borderColor: "red" },
                { verticalAlign: 'top' }
              ]}
              placeholder="Enter your content"
              onChangeText={setContent}
              value={content}
              numberOfLines={3}

            />



          </View>

          {spinner ? (
            <TouchableOpacity style={styles.postButton}>
              <ActivityIndicator color={COLORS.white} size="small" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.postButton} onPress={handleSubmit}>
              <Text style={styles.postButtonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>







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

export default FeedbackAndComplaintForm;