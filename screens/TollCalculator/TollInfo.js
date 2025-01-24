import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Modal,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Toast from "react-native-toast-message";
import { COLORS } from "../../constants";
import { ScrollView, TouchableOpacity } from "react-native";
import RenderHTML from 'react-native-render-html';


const TollInfo = () => {
  const apiKey = "AIzaSyCLT-nqnS-13nBpe-mqzJVsRK7RZIl3I5s";
  const [startingPoint, setStartingPoint] = useState("");
  const [endingPoint, setEndingPoint] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [isStartingPointModalVisible, setStartingPointModalVisible] =
    useState(false);
  const [isEndingPointModalVisible, setEndingPointModalVisible] =
    useState(false);
  const [routeDetails, setRouteDetails] = useState(null);
  const [steps, setSteps] = useState([])

  const fetchRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
          start
        )}&destination=${encodeURIComponent(end)}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.status === "OK") {
        return data;
      } else {
        throw new Error(`Directions request failed due to ${data.status}`);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleCalculate = async () => {
    try {
      const result = await fetchRoute(startingPoint, endingPoint);

      const routes = result.routes;



      if (routes.length > 0) {
        const route = routes[0];

        const steps = route.legs[0]?.steps.map((step, index) => {
          return step.html_instructions
        })
        setSteps(steps)


        const tollData = calculateTolls(route, vehicleType);

        setRouteDetails({
          distance: route.legs[0].distance.text,
          duration: route.legs[0].duration.text,
          tollCount: tollData.count,
          totalCost: tollData.totalCost,
        });
      } else {
        setRouteDetails({
          distance: "N/A",
          duration: "N/A",
          tollCount: 0,
          totalCost: 0,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error fetching directions",
        text2: "Please try again later",
      });
      setRouteDetails({
        distance: "N/A",
        duration: "N/A",
        tollCount: 0,
        totalCost: 0,
      });
    }
  };


  const calculateTolls = (route, vehicleType) => {
    const tollLocations = route.legs[0].steps.filter((step) =>
      step.html_instructions.includes("Toll")
    );
    const tollCount = tollLocations.length;

    const tollCosts = {
      'car': 110,
      'lcv': 170,
      'Upto 3 Axle Vehicle': 370,
      '4-to-6-axle': 580,
      '7-or-more-axle': 650,
      'hcm-eme': 750
    };

    const totalCost = tollCount * (tollCosts[vehicleType] || 0);
    return { count: tollCount, totalCost: totalCost };
  };



  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Starting Point</Text>
      <TextInput
        style={styles.input}
        value={startingPoint}
        onFocus={() => setStartingPointModalVisible(true)}
        onPress={() => setStartingPointModalVisible(true)}
        placeholder="Enter starting point"
      />


      <Text style={styles.label}>Ending Point</Text>
      <TextInput
        style={styles.input}
        value={endingPoint}
        onFocus={() => setEndingPointModalVisible(true)}
        onPress={() => setEndingPointModalVisible(true)}
        placeholder="Enter ending point"
      />

      <Text style={styles.label}>Vehicle Type</Text>
      <View style={styles.pickerContainer}>
        <Picker

          selectedValue={vehicleType}
          onValueChange={(itemValue) => setVehicleType(itemValue)}
        >
          <Picker.Item label="Select vehicle type" value="" />
          <Picker.Item label="Car/Jeep/Van" value="car" />
          <Picker.Item label="LCV" value="lcv" />
          <Picker.Item label="Upto 3 Axle Vehicle" value="upto-3-axle" />
          <Picker.Item label="4 to 6 Axle" value="4-to-6-axle" />
          <Picker.Item label="7 or more Axle" value="7-or-more-axle" />
          <Picker.Item label="HCM/EME" value="hcm-eme" />
        </Picker>
      </View>

      <Button
        disabled={startingPoint !== "" && endingPoint !== "" && vehicleType !== "" ? false : true}
        title="Calculate"
        color={COLORS.primary}
        onPress={handleCalculate} />

{routeDetails && (
  <>
    <Text style={styles.routeHeader}>Route Details</Text>
    <ScrollView style={styles.detailsContainer}>
      <View style={styles.statsContainer}>
        <View style={styles.statContainer}>
          <Text style={styles.statCount}>Distance</Text>
          <Text style={styles.statLabel}>{routeDetails.distance}</Text>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statContainer}>
          <Text style={styles.statCount}>Duration</Text>
          <Text style={styles.statLabel}>{routeDetails.duration}</Text>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statContainer}>
          <Text style={styles.statCount}>Number of Tolls</Text>
          <Text style={styles.statLabel}>{routeDetails.tollCount}</Text>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statContainer}>
          <Text style={styles.statCount}>Total Toll Cost</Text>
          <Text style={styles.statLabel}>
            {routeDetails.totalCost} INR (Approximate value)
          </Text>
        </View>
      </View>
      {/* <View style={styles.statsContainer}>
        <View style={styles.statContainer}>
          <Text style={styles.statCount}>Route</Text>
          {steps.length > 0
            ? steps.map((step, index) => (
                <Text key={index} style={styles.stepText}>
                  {step}
                </Text>
              ))
            : null}
        </View>
      </View> */}
    </ScrollView>
  </>
)}
     





      <Modal visible={isStartingPointModalVisible} animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>From Location</Text>
            <View style={styles.locationContainer}>
              <GooglePlacesAutocomplete
                placeholder="Search for starting point"
                onPress={(data) => {
                  setStartingPoint(data.description);
                  setStartingPointModalVisible(false);
                }}
                textInputProps={{
                  autoFocus: true,
                }}
                query={{
                  key: apiKey, // Use your hardcoded key if Config is not working
                  language: 'en',
                  components: 'country:in',
                }}
                styles={{
                  textInputContainer: styles.autocompleteContainer,
                  textInput: styles.autocompleteInput,
                }}
              />
              <Button
                color={COLORS.primary}
                title="Close"
                onPress={() => setStartingPointModalVisible(false)}
              />

            </View>
          </View>
        </View>
      </Modal>


      <Modal visible={isEndingPointModalVisible} animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>To Location</Text>


            <View style={styles.locationContainer}>
              <GooglePlacesAutocomplete
                placeholder="Search for ending point"
                onPress={(data) => {
                  setEndingPoint(data.description);
                  setEndingPointModalVisible(false);
                }}
                textInputProps={{
                  autoFocus: true,
                }}
                query={{
                  key: apiKey, // Use your hardcoded key if Config is not working
                  language: 'en',
                  components: 'country:in',
                }}
                styles={{
                  textInputContainer: styles.autocompleteContainer,
                  textInput: styles.autocompleteInput,
                }}
              />

              <Button
                color={COLORS.primary}
                title="Close"
                onPress={() => setEndingPointModalVisible(false)}
              />




            </View>
          </View>
        </View>
      </Modal>



      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 15,
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 20,

  },
  results: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  resultsTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  autocompleteContainer: {
    width: "100%",
  },
  autocompleteInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 10,
  },
  statContainer: {
    alignItems: "left",
    flex: 1,
  },
  statCount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#999",
  },
  routeHeader: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: 'left',
    color: "maroon",
    marginTop: 10
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
  detailsContainer: {
    minHeight: 200, // Adjust as needed to limit the scrollable area
    marginBottom: 16,
    padding: 8,
    // borderWidth: 1,
    // borderColor: "#ccc",
    borderRadius: 4,
    // backgroundColor: "#f9f9f9",
  },
  stepText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
});

export default TollInfo;