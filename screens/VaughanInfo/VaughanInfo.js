import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import HeaderWithOutBS from "../../components/HeaderWithOutBS";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
} from "react-native";
import axiosInstance from "../../services/axiosInstance";
import { LoadNeedsContext } from "../../hooks/LoadNeedsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Entypo from '@expo/vector-icons/Entypo';
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Constants from 'expo-constants'
import DeleteConfirmationModal from "../DeleteConfirmationModal";




const VaughanInfo = ({ navigation }) => {


    // cdn link
    const cdnLink = Constants.expoConfig?.extra?.REACT_APP_CDN_LINK 


  // google api key
  const googleApiKey = Constants.expoConfig?.extra?.REACT_APP_GOOGLE_PLACES_KEY


  const { isLoading } = useContext(LoadNeedsContext);
  const [expense, setExpenses] = useState([]);
  const [update, setUpdate] = useState(false);

  const [fromLocationModal, setFromLocationModal] = useState(false)
  const [toLocationModal, setToLocationModal] = useState(false)

  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteItem, setDeleteItem] = useState({})

  useEffect(() => {
    const getLoadTripExpenseDetails = async () => {
      try {
        const response = await axiosInstance.post("/user_load_trip_details", {
          user_id: await AsyncStorage.getItem("user_id"),
        });
        if (response.data.error_code === 0) {
          setExpenses(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getLoadTripExpenseDetails();
  }, [update, isLoading]);

  const renderDetailsButton = (item) => {
    return (
      <>
        <TouchableOpacity
          style={[styles.button,{backgroundColor :'green'}]}
          onPress={() => handleDetailsPress(item)}
        >
          <Text style={[styles.buttonText,]}>View Full Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            setDeleteModal(true)
            setDeleteItem(item)
          }}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </>
    );
  };

  const handleDeleteTrip = async (item) => {
    try {
      const tripDeleteParameter = {
        load_trip_id: item.load_trip_id,
      };

      const response = await axiosInstance.post(
        "/remove_load_trip_entry",
        tripDeleteParameter
      );
      if (response.data.error_code === 0) {
        setUpdate(!update);
      }
    } catch (error) { }
  };

  const handleDetailsPress = (item) => {
    navigation.navigate("LoadExpenseCalculator", { item });
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalValues, setModalValues] = useState({
    fromLocation: "",
    toLocation: "",
    loadName: "",
  });
  const [errorFields, setErrorFields] = useState({
    fromLocation: false,
    toLocation: false,
    loadName: false,
  });

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);

    setModalValues({
      fromLocation: "",
      toLocation: "",
      loadName: "",
    });
    setErrorFields({
      fromLocation: false,
      toLocation: false,
      loadName: false,
    });
  };

  const handleInputChange = (field, value) => {
    setModalValues({ ...modalValues, [field]: value });
    setErrorFields({ ...errorFields, [field]: false });
  };

  const applyFilter = async () => {
    let hasError = false;
    const errors = {};

    Object.keys(modalValues).forEach((key) => {
      if (!modalValues[key]) {
        errors[key] = true;
        hasError = true;
      }
    });

    if (hasError) {
      setErrorFields(errors);
      return;
    }

    try {
      const addLoadTripDetailsParamters = {
        user_id: await AsyncStorage.getItem("user_id"),
        load_name: modalValues.loadName,
        from_location: modalValues.fromLocation,
        to_location: modalValues.toLocation,
      };
      const response = await axiosInstance.post(
        "/load_trip_entry",
        addLoadTripDetailsParamters
      );
      console.log(response);
      if (response.data.error_code === 0) {
        setUpdate(!update);
      } else {
        console.log(response);
      }
    } catch (error) { }

    toggleModal();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.item}>
        <View style={styles.itemContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{item.load_name}</Text>
          </View>
          <View style={styles.tableContainer}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>
                <Entypo name="location-pin" size={24} color="green" />
              </Text>
              <Text style={styles.tableValue}>{item.from_location}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>
                <Entypo name="location-pin" size={24} color="red" />
              </Text>
              <Text style={styles.tableValue}>{item.to_location}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Credit amount:</Text>
              <Text style={styles.tableValue}>₹ {item.load_price}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Debit amount:</Text>
              <Text style={styles.tableValue}>₹ {item.spend_amount}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Available balance:</Text>
              <Text style={styles.tableValue}>₹ {item.balance_amount}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.buttons}>{renderDetailsButton(item)}</View>
    </View>
  );


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


  const handleYes = () => {
    setDeleteModal(false);
    handleDeleteTrip(deleteItem)
  };

  const handleCancel = () => {
    setDeleteModal(false);
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <HeaderWithOutBS title="Expense Calculator" />

        <View style={styles.container}>
          <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
            <Text style={styles.addButtonText}>Add Trip Details</Text>
          </TouchableOpacity>
          {
            expense.length === 0 ?
            <View style={styles.noResultContainer}>
            <View>
              <Image
                 source={{ uri: `${cdnLink}/Folder_empty.png` }}
                width={50}
                height={50}
                resizeMode="center"
              />
            </View>
            <Text style={styles.noResultsText}>No records</Text>

          </View>
              :
              <FlatList
                data={expense}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
              />
          }
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Options</Text>
            <TextInput
              style={[styles.input, errorFields.loadName && styles.inputError]}
              placeholder="Load Name"
              value={modalValues.loadName}
              onChangeText={(text) => handleInputChange("loadName", text)}
            />
            <TextInput
              style={[
                styles.input,
                errorFields.fromLocation && styles.inputError,
              ]}
              placeholder="From Location"
              value={modalValues.fromLocation}
              onPress={() => setFromLocationModal(true)}
            />
            <TextInput
              style={[
                styles.input,
                errorFields.toLocation && styles.inputError,
              ]}
              placeholder="To Location"
              value={modalValues.toLocation}
              onPress={() => setToLocationModal(true)}
            />

            <TouchableOpacity style={styles.applyButton} onPress={applyFilter}>
              <Text style={styles.applyButtonText}>Add Trip Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
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


      {/* Delete Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModal}
        onRequestClose={() => setDeleteModal(false)}
      >
        <DeleteConfirmationModal handleYes={handleYes} handleCancel={handleCancel} />
      </Modal>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 10,
  },
  card: {
    marginTop: 10,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tableContainer: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  tableLabel: {
    fontWeight: "bold",
    marginRight: 5,
  },
  tableValue: {
    flex: 1,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center", // Align button to the right
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: COLORS.brand,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    padding: 10,
    margin: 20,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 12,
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
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#3194d6",
  },
  titleContainer: {
    backgroundColor: "#f1f2ff", // Change to desired background color
    padding: 10, // Add padding
    borderRadius: 5, // Optional: Add border radius
    marginBottom: 10, // Add some margin below the title
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
  noResultContainer: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flex:1

  },
  noResultsText: {
    textAlign: "center",
    marginTop: -90,
    marginBottom: 30,
    color: "grey",
    fontSize: 16,
  },
});

export default VaughanInfo;
