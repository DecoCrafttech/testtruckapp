import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "../../constants";

const MileageForm = () => {
  const [distance, setDistance] = useState("");
  const [fuel, setFuel] = useState("");
  const [price, setPrice] = useState("");

  const [distanceValid, setDistanceValid] = useState(true);
  const [fuelValid, setFuelValid] = useState(true);
  const [priceValid, setPriceValid] = useState(true);

  const [result, setResult] = useState({
    distance: "",
    fuel: "",
    totalAmount: "",
    fuelExpense: "",
    mileage: "",
  });

  const calculateMileage = () => {
    const parsedDistance = parseFloat(distance);
    const parsedFuel = parseFloat(fuel);
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedDistance) || isNaN(parsedFuel) || isNaN(parsedPrice)) {
      console.error("Please enter valid numbers");
      return;
    }

    if (parsedFuel === 0) {
      console.error(
        "Fuel amount cannot be zero. Please enter a valid fuel amount."
      );
      return;
    }

    const totalAmount = parsedPrice * parsedFuel;
    const fuelExpense = totalAmount / parsedDistance;
    const mileage = parsedDistance / parsedFuel;

    setResult({
      distance: `${distance} Km`,
      fuel: `${fuel} Liters`,
      totalAmount: `${totalAmount.toFixed(2)} INR`,
      fuelExpense: `${fuelExpense.toFixed(2)} INR/Km`,
      mileage: `${mileage.toFixed(2)} Km/Liters`,
    });
  };

  const resetForm = () => {
    setDistance("");
    setFuel("");
    setPrice("");
    setResult({
      distance: "",
      fuel: "",
      totalAmount: "",
      fuelExpense: "",
      mileage: "",
    });
    setDistanceValid(true);
    setFuelValid(true);
    setPriceValid(true);
  };

  const handlePostAdd = () => {
    let isValid = true;

    // Validate distance
    if (!distance.trim()) {
      setDistanceValid(false);
      isValid = false;
    } else {
      setDistanceValid(true);
    }

    // Validate fuel
    if (!fuel.trim()) {
      setFuelValid(false);
      isValid = false;
    } else {
      setFuelValid(true);
    }

    // Validate price
    if (!price.trim()) {
      setPriceValid(false);
      isValid = false;
    } else {
      setPriceValid(true);
    }

    if (isValid) {
      calculateMileage(); // Proceed with calculation if all fields are valid
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.textInputContainer}>
        <Text style={styles.label}>Distance</Text>
        <TextInput
          style={[styles.textInput, !distanceValid && { borderColor: "red" }]}
          placeholder="Distance"
          onChangeText={setDistance}
          value={distance}
          keyboardType="number-pad"
        />
        <Text style={styles.label}>Fuel</Text>
        <TextInput
          style={[styles.textInput, !fuelValid && { borderColor: "red" }]}
          placeholder="Fuel"
          onChangeText={setFuel}
          value={fuel}
          keyboardType="number-pad"

        />
        <Text style={styles.label}>Price</Text>
        <TextInput
          style={[styles.textInput, !priceValid && { borderColor: "red" }]}
          placeholder="Price"
          onChangeText={setPrice}
          value={price}
          keyboardType="number-pad"

        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handlePostAdd}>
          <Text style={styles.buttonText}>Calculate</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.cell}>
            <Text style={styles.cellText}>Distance</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellText}>{result.distance}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}>
            <Text style={styles.cellText}>Fuel</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellText}>{result.fuel}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}>
            <Text style={styles.cellText}>Total Amount</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellText}>{result.totalAmount}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}>
            <Text style={styles.cellText}>Fuel Expense</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellText}>{result.fuelExpense}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}>
            <Text style={styles.cellText}>Mileage</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellText}>{result.mileage}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
    borderColor: "#d3d3d3",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "stretch",
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    borderWidth: 1,
    borderColor: "black",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  cellText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    backgroundColor: COLORS.brand,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "40%",
  },
  buttonText: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: "700",
  },
  resetButton: {
    backgroundColor: "green", // Set your desired color for the reset button here
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "40%",
  },
});

export default MileageForm;
