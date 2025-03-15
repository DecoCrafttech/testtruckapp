import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import Header from "../../components/Header";
import DropDownPicker from "react-native-dropdown-picker";
import axiosInstance from "../../services/axiosInstance";
import LoadDetails from "../AvailabaleLoads/LoadDetails";
import MarketPlace from "./MarketPlace";
import EditModal from "./EditModal";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from 'react-native-vector-icons/Ionicons';
import PetrolBunkMyPosts from "../Petrolbunks/PetrolBunkMyPosts";


const Refer = () => {



  const [selectedValue, setSelectedValue] = useState(null);
  const [allLoadData, setAllLoadData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editedDetails, setEditedDetails] = useState(null);
  const [selectedStates, setSelectedStates] = useState([])

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "Load Posts", value: "user_load_details" },
    { label: "Driver Posts", value: "user_driver_details" },
    { label: "Truck Posts", value: "user_truck_details" },
    { label: "Buy and Sell Posts", value: "user_buy_sell_details" },
    { label: "Petrol Bunks", value: "petrol_bunks" },
  ]);

  useFocusEffect(
    React.useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress)

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress)
      }
    })
  )

  const handleBackPress = () => {
    Alert.alert('Exit App', 'Are you sure want to exit?',
      [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel'
        },
        {
          text: 'Exit',
          onPress: () => BackHandler.exitApp()
        }
      ]
    )
    return true
  }


  const handleEdit = (item) => {

    setEditItem(item);
    setEditModalVisible(true);
  };

  const handleSaveChanges = async () => {
    try {
      setEditModalVisible(false);
      await saveEditedDetails();
    } catch (error) {
      console.log("Error updating load details:", error);
    }
  };


  const saveEditedDetails = async () => {
    let editingParams;
    if (selectedValue === "user_load_details") {
      editingParams = {
        "company_name": editedDetails.companyName,
        "contact_no": editedDetails.contactNumber,
        "description": editedDetails.description,
        "from_location": editedDetails.fromLocation,
        "id": editedDetails.id,
        "load_id": editedDetails.loadId,
        "material": editedDetails.material,
        "no_of_tyres": editedDetails.numberOfTyres,
        "profile_name": editedDetails.fromLocation,
        "to_location": editedDetails.toLocation,
        "tone": editedDetails.ton,
        "truck_body_type": editedDetails.truckBodyType,
        "updt": editedDetails.updatedTime,
        "user_id": editedDetails.userId,
        "user_post": editedDetails.userPost,
        "from": editedDetails.fromLocation,
        "to": editedDetails.toLocation
      }

      try {

        const response = await axiosInstance.post(
          "/load_details",
          editingParams
        );


        if (response.data.error_code === 0) {
          fetchData(selectedValue);
        }
      } catch (error) {
        console.error("Error:", error);
      }

      

    } else if (selectedValue === "user_driver_details") {
      editingParams = {
        "company_name": editedDetails.companyName,
        "contact_no": editedDetails.contactNumber,
        "description": editedDetails.description,
        "driver_id": editedDetails.driverId,
        "driver_name": editedDetails.driverName,
        "from": editedDetails.fromLocation,
        "to": selectedStates,
        "no_of_tyres": editedDetails.numberOfTyres,
        "truck_body_type": editedDetails.truckBodyType,
        "truck_name": editedDetails.truckName,
        "user_id": editedDetails.userId,
        "vehicle_number": editedDetails.vehicleNumber,
      }

      console.log("editingParams", editingParams)

      try {
        const response = await axiosInstance.post(
          "/driver_entry",
          editingParams
        );

        if (response.data.error_code === 0) {
          fetchData(selectedValue);
        }
      } catch (error) {
        console.error("Error:", error);
      }

    } else if (selectedValue === "user_truck_details") {
      editingParams = {
        "company_name": editedDetails.companyName,
        "contact_no": editedDetails.contactNumber,
        "description": editedDetails.description,
        "from_location": editedDetails.fromLocation,
        "from": editedDetails.fromLocation,
        "id": editedDetails.id,
        "name_of_the_transport": editedDetails.transportName,
        "no_of_tyres": editedDetails.numberOfTyres,
        "profile_name": editedDetails.profileName,
        "to": selectedStates,
        "to": selectedStates,
        "tone": editedDetails.ton,
        "truck_body_type": editedDetails.truckBodyType,
        "truck_brand_name": editedDetails.truckBrandName,
        "truck_id": editedDetails.truckId,
        "truck_name": editedDetails.truckName,
        "updt": editedDetails.updatedTime,
        "user_id": editedDetails.userId,
        "user_post": editedDetails.userPost,
        "vehicle_number": editedDetails.vehicleNumber,
        "truck_size": editedDetails.truckSize
      }

      try {
        const response = await axiosInstance.post(
          "/truck_entry",
          editingParams
        );

        if (response.data.error_code === 0) {
          fetchData(selectedValue);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };



  const [showFeedbackInput, setShowFeedbackInput] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const handleYes = () => {
    setShowFeedbackInput(false);
  };

  const handleNo = () => {
    setShowFeedbackInput(true);
  };

  const [feedbackType, setFeedbackType] = useState("");

  const [feedbackModalData, setFeedbackModalData] = useState({
    item: null,
    type: "",
    selected: "",
  });

  const handleSubmit = () => {
    const { item, type, selected } = feedbackModalData;

    if (!showFeedbackInput) {
      if (feedback.trim() === "") {
        Alert.alert("Error", "Please enter your feedback");
      } else {
        Alert.alert("Success", "Thank you for your feedback!");
        setFeedback("");
        handleDelete(item, type, selected);
        handleFeedBackModalClose();
      }
    } else {
      if (mobileNumber.trim() === "") {
        Alert.alert("Error", "Please enter your mobile number");
      } else {
        // Handle mobile number submission logic
        Alert.alert("Success", "Mobile number submitted successfully!");
        setMobileNumber("");
        handleDelete(item, type, selected);
        handleFeedBackModalClose();
      }
    }
  };

  const handleFeedBackModal = (item, type, selected) => {
    setFeedbackType(type);
    setFeedbackModalVisible(true);
    setFeedbackModalData({ item, type, selected });
  };

  const handleDelete = async (item, type, selected) => {
    let deleteParameters = {};
    let apiDelete;

    switch (type) {
      case "load":
        apiDelete = "remove_load_details";
        deleteParameters = {
          load_id: item.load_id,
        };
        break;
      case "driver":
        apiDelete = "remove_driver_entry";
        deleteParameters = {
          driver_id: item.driver_id,
        };

        break;
      case "truck":
        apiDelete = "remove_truck_entry";
        deleteParameters = {
          truck_id: item.truck_id,
        };
        break;

      default:
        break;
    }

    try {
      const response = await axiosInstance.post(
        `/${apiDelete}`,
        deleteParameters
      );

      if (response.data.error_code === 0) {
        fetchData(selected);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };


  useFocusEffect(
    useCallback(() => {
      setSelectedValue("user_load_details");
      fetchData("user_load_details"); // Fetch data when screen is focused
    }, [])
  );


  const fetchData = async (selectedValue) => {
    setLoading(true);
    const userPostParameters = {
      user_id: await AsyncStorage.getItem("user_id"),
    };

    try {

      let response;
      if (selectedValue === "petrol_bunks") {
        response = await axiosInstance.post(`https://truck.truckmessage.com/get_petrol_bunk_details`, {});
      } else {
        response = await axiosInstance.post(
          `/${selectedValue}`,
          userPostParameters
        );
      }

      if (response.data.error_code === 0) {
        switch (selectedValue) {
          case "user_load_details":

            const transformedData = response.data.data.map((item) => ({
              companyName: item.company_name,
              contactNumber: item.contact_number,
              truckBodyType: item.truck_body_type,
              updatedTime: item.updt,
              title: item.company_name,
              fromLocation: item.from_location,
              toLocation: item.to_location,
              ownerName: item.profile_name,
              labels: [
                { icon: "table-view", text: item.material },
                { icon: "attractions", text: `${item.no_of_tyres} wheels` },
                { icon: "monitor-weight", text: `${item.tone} tons` },
                { icon: "local-shipping", text: item.truck_body_type },
                { icon: "person", text: item.profile_name },
              ],
              description: item.description,
              onButton1Press: () => handleEdit(item),
              onButton2Press: () =>
                handleFeedBackModal(item, "load", "user_load_details"),
            }));
            setAllLoadData(transformedData);

            break;
          case "user_driver_details":
            setAllLoadData([]);
            const transformedDriverData = response.data.data.map((item) => ({
              companyName: item.company_name,
              title: item.driver_name,
              transportName: item.name_of_the_transport,
              fromLocation: item.from_location,
              toLocation: item.to_location,
              updatedTime: item.updt,
              labels: [
                { icon: "directions-bus", text: item.vehicle_number },
                { icon: "attractions", text: `${item.no_of_tyres} wheels` },
                { icon: "local-shipping", text: item.truck_body_type },
                { icon: "person", text: item.driver_name },

              ],
              description: item.description,
              onButton1Press: () => handleEdit(item),
              onButton2Press: () =>
                handleFeedBackModal(item, "driver", "user_driver_details"),
            }));

            setAllLoadData(transformedDriverData);
            break;
          case "user_truck_details":
            setAllLoadData([]);
            const transformedAllTruckData = response.data.data.map((item) => ({
              updatedTime: item.updt,
              companyName: item.company_name,
              title: item.company_name,
              fromLocation: item.from_location,
              toLocation: item.to_location,
              transportName: item.name_of_the_transport,
              truckSize: item.truck_size,
              labels: [
                { icon: "table-view", text: `${item.truck_size} ft` },
                { icon: "directions-bus", text: item.vehicle_number },
                { icon: "attractions", text: `${item.no_of_tyres} wheels` },
                { icon: "local-shipping", text: item.truck_body_type },
                { icon: "line-weight", text: `${item.tone} tons` },
                { icon: "attractions", text: item.vehicle_number },
              ],
              description: item.description,
              onButton1Press: () => handleEdit(item),
              onButton2Press: () =>
                handleFeedBackModal(item, "truck", "user_truck_details"),
            }));
            setAllLoadData(transformedAllTruckData);
            break;

          case "user_buy_sell_details":
            setAllLoadData(response.data.data.reverse());
            break;
          case "petrol_bunks":
            setAllLoadData(response.data.data.reverse());
            break;
          default:
            break;
        }
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedBackModalClose = () => {
    setFeedbackModalVisible(false);
  };


  const [rating, setRating] = useState(0); // Default rating

  // Function to handle star press
  const handleStarPress = (star) => {
    setRating(star);
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <Header title="My Posts" />
        <View style={styles.container}>
          <DropDownPicker
            open={open}
            value={selectedValue}
            items={items}
            setOpen={setOpen}
            setValue={(value) => {
              setSelectedValue(value);
              fetchData(value());
            }}
            setItems={setItems}
            placeholder="Select Category"
            containerStyle={{ height: 40, marginBottom: 20 }}
            style={{ backgroundColor: "#fafafa" }}
          />
          {loading ? (
            <View style={[styles.loadingContainer, styles.loadingHorizontal]}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : selectedValue === "user_buy_sell_details" ? (
            <MarketPlace allData={allLoadData} editedDetails={editedDetails} fetchData={fetchData} />
          ) : selectedValue === "petrol_bunks" ? (
            <PetrolBunkMyPosts allData={allLoadData} editedDetails={editedDetails} fetchData={fetchData} />
          ) : (
            <LoadDetails
              filteredTrucks={allLoadData}
              status="editAndDelete"
              handleEdit={handleEdit}
              selectedValue={selectedValue}
            />
          )}
        </View>
        <EditModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          onSave={handleSaveChanges}
          loadDetails={editItem}
          selectedValue={selectedValue}
          editedDetails={editedDetails}
          setEditedDetails={setEditedDetails}
          selectedStates={selectedStates}
          setSelectedStates={setSelectedStates}
        />

        <Modal
          visible={feedbackModalVisible}
          onClose={() => {
            setFeedbackModalVisible(false);
          }}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setFeedbackModalVisible(false);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.header}>
                {/* Did you post the {feedbackType} details using this platform? */}
                Did you get leads using this platform?
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    showFeedbackInput && styles.selectedButton,
                  ]}
                  onPress={handleNo}
                >
                  <Text style={styles.buttonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    !showFeedbackInput && styles.selectedButton,
                  ]}
                  onPress={handleYes}
                >
                  <Text style={styles.buttonText}>No</Text>
                </TouchableOpacity>
              </View>

              {showFeedbackInput ? (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mobile Number:</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="phone-pad"
                      value={mobileNumber}
                      onChangeText={(text) => setMobileNumber(text)}
                      placeholder="Enter your mobile number"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Ratings</Text>
                    <View style={styles.starContainer}>
                      {/* Render 5 stars */}
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => handleStarPress(star)}
                        >
                          <Ionicons
                            name={star <= rating ? "star" : "star-outline"} // Filled or outlined star
                            size={32}
                            color="#ffd700" // Gold color for stars
                            style={styles.star}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Feedback:</Text>
                  <TextInput
                    style={styles.input}
                    multiline
                    numberOfLines={6}
                    value={feedback}
                    onChangeText={(text) => setFeedback(text)}
                    placeholder="Type your feedback here"
                  />
                </View>
              )}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleFeedBackModalClose}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingHorizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
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
    width: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: COLORS.gray,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  selectedButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: COLORS.brand,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  star: {
    marginHorizontal: 5,
  },
});

export default Refer;
