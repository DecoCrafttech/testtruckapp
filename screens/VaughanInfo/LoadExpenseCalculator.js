import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import HeaderWithOutBS from "../../components/HeaderWithOutBS";
import ExpenseHistory from "./ExpenseHistory";
import axiosInstance from "../../services/axiosInstance";
import { LoadNeedsContext } from "../../hooks/LoadNeedsContext"
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';



const LoadExpenseCalculator = ({ route }) => {

  const { item } = route.params;

  const { isLoading, setIsLoading } = useContext(LoadNeedsContext)

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cashStatus, setCashStatus] = useState("");
  const [modalValues, setModalValues] = useState({
    name: "",
    description: "",
    amount: "",
  });
  const [errorFields, setErrorFields] = useState({
    name: false,
    amount: false,
    description : false
  });

  const toggleModal = (cash) => {
    setCashStatus(cash);
    setIsModalVisible(!isModalVisible);
    setModalValues({
      name: "",
      amount: "",
      description: "",

    });
    setErrorFields({
      name: false,
      amount: false,
      description : false

    });


  };

  const [cashFlowExpenseHistory, setCashFlowExpenseHistory] = useState([]);
  const [updateCashFlowStatus, setUpdateCashFlowStatus] = useState(false)
  const [initalCash, setInitialCash] = useState({
    cashIn: "",
    cashOut: ""
  })
  const [loadPrice, setLoadPrice] = useState("")

  useEffect(() => {

    const getInitialBalance = async () => {
      try {
        const getCashFlowParamter = {
          load_trip_id: item.load_trip_id,
        };
        const response = await axiosInstance.post(
          "/initial_cash_in_out",
          getCashFlowParamter
        );


        if (response.data.error_code === 0) {
          setInitialCash({
            cashIn: response.data.data[0].available_cash,
            cashOut: response.data.data[0].spend_amount
          })
          setLoadPrice(response.data.data[0].load_price)
        }
      } catch (error) {
        console.log(error)
      }
    }

    getInitialBalance();

    const getFlowCashTrip = async () => {
      try {
        const getCashFlowParamter = {
          load_trip_id: item.load_trip_id,
        };
        const response = await axiosInstance.post(
          "/get_load_trip_cash_flow",
          getCashFlowParamter
        );
        if (response.data.error_code === 0) {
          setCashFlowExpenseHistory(response.data.data);
          setIsLoading(!isLoading)
        }
      } catch (error) { }
    };

    getFlowCashTrip();
  }, [updateCashFlowStatus]);

  const handleInputChange = (field, value) => {
    setModalValues({ ...modalValues, [field.toLowerCase()]: value }); // Ensure field is lowercase
    setErrorFields({ ...errorFields, [field.toLowerCase()]: false }); // Ensure field is lowercase
  };


  const handleCashInOut = async () => {

    let hasError = false;
    const errors = {};

    Object.keys(modalValues).forEach((key) => {
      if (!modalValues[key]) {
        errors[key] = true;
        hasError = true;
      }
    });

    if (hasError === true) {
      setErrorFields(errors);
      return;
    }

    try {


      const loadTripCashFlowEntryParameters = {
        load_trip_id: item.load_trip_id,
        cash_flow_name: modalValues.name,
        category: "",
        description:  modalValues.description,
        cash_flow_type: cashStatus === "Credit entry" ? "IN" : "OUT",
        amount: modalValues.amount,

      };

      const response = await axiosInstance.post("/load_trip_cash_flow_entry", loadTripCashFlowEntryParameters);

      if (response.data.error_code === 0) {
        setUpdateCashFlowStatus(!updateCashFlowStatus);
      } else {
        Alert.alert(response.data.message);
      }
    } catch (error) {
      console.error("Error occurred during API call:", error);
    }

    toggleModal();
  };


  const handleButtonPress = (cash) => {
    toggleModal(cash);
  };

  const generatePDF = async () => {
    try {
      const htmlContent = `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Expense Report</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            padding-bottom: 100px;
        }
        .header, .footer {
            background-color: #007bff;
            color: white;
            text-align: center;
            padding: 15px;
            font-weight: bold;
        }
        .report-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        }
        .table-container {
            overflow-x: auto;
        }
        .table th {
            background-color: #007bff;
            color: white;
            text-align: center;
        }
        .credit {
            color: green;
            font-weight: bold;
        }
        .debit {
            color: red;
            font-weight: bold;
        }
        .icon {
            font-size: 18px;
            margin-right: 5px;
        }
        .pagination {
            display: flex;
            justify-content: center;
            margin-top: 15px;
        }
        .watermark {
            position: absolute;
            bottom: 50%;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0.15;
            width: 250px;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <div class="header">Truck Message Trip Expense Report</div>

    <div class="container mt-4">
        <div class="report-card">
            <h2 class="text-primary text-center">Expense Summary</h2>
            <p><strong>Load Name:</strong> ${item.load_name}</p>
            <p><strong>Credit Amount:</strong> <span class="credit">₹${loadPrice}</span></p>
            <p><strong>Debit Amount:</strong> <span class="debit">₹${initalCash.cashOut}</span></p>
            <p><strong>Available Balance:</strong> <span class="text-dark">₹${initalCash.cashIn}</span></p>
        </div>

        <h3 class="mt-4 text-secondary">Expense History:</h3>
        <div class="table-container">
            <table class="table table-hover table-bordered">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Credit/Debit</th>
                        <th>Type</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${cashFlowExpenseHistory
          .map(
            (entry) => `
                          <tr>
                              <td>${entry.cash_flow_name}</td>
                              <td>₹${entry.amount}</td>
                              <td class="${entry.cash_flow_type === 'IN' ? 'credit' : 'debit'}">
                                  ${entry.cash_flow_type === 'IN' ? 'Credited' : ' Debited'}
                              </td>
                              <td>${new Date(entry.updt).toLocaleString()}</td>
                          </tr>`
          )
          .join("")}
                </tbody>
            </table>
        </div>

        
    </div>

   
    
    <!-- Base64 Watermark Logo -->
    <img class="watermark" src="data:image/jpeg;base64,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3+e6tfUeyNqW31NZ9wNCea+99gqCm3Fsz33NNWA7b775ZlDSuH9QNLkn169fX/B7HBu/M35bWUyePDkoevxO2wMKAL/p559/3ubPn5/5Ge5dFF8U40JwnBxvqdfIr4ErRKLnIA9AN2T69Ok2duzY8DDGWkbg4foE/h48eLAdeeSRTV6BJAgXf0hiPZUbjmfTpk02btw4ay08bBEuPMjZDg93LP4krI8ZMyZY/zzs0vA+HgEUgdZy0EEHhaUUUD54kKIwtJavfe1rYXzOP/98++QnPxle46F+yy232G233WZXXHGFDRgwoOi+AUWoJRBibKs115ox5D761Kc+ZYceeqg9+OCD4V779re/Hc736aefth//+McFv4/SsXz5cps0qf2N6NkWQm/Dhg1h32nLlnukXB4ulB4UM86T3xjjgDJ00kknFVQseJ1zZYwLHQtjiIenvSCI+V384he/sI985CN2/PHNe/3imeE58IlPfKLodngGMKb8X8o1QlFwhZNnS0vKseg+SAHopvBDvOqqq+yzn/1sePgceOCB4XXctwiXs88+e7fv4CblAYeAxsXJd3BJJoUeHgVCCzfddFPwJGBN4A4mro5gff/7329nnXVW0+dxl/7hD38I1ivvIxR52P3yl7+01oCFyQPu5JNPDsKK759zzjm2//77W2eA8H3qqafC+d9zzz3BgnLlAyFw3XXXhbHlAc/YM4YsPBh//vOfB4WsJfgsCg7/H3bYYXbppZc2vTdlyhQ788wz7XOf+5ydd955waoFLE8UBty+gIub/eI5QBHAtcy1TMa9Edacy09+8pOgJPAA59rgskd5ylKckhBSOvroo8O5Zn32mGOOsf/6r/9qWufYGDfuL/aDkMZbwJhxL3J/InA+85nPhONHoHLfcc3vv//+cM/88z//c5P3JXlNuBZ4IrCiUQz57v/4H/+jSeFNg8eC+/arX/1qOJYLL7zQrr76aisFPGuMN4t7G7j/f/azn4X/k3ANbr/99pB/wHXg/HD1MzbXXHNNSftD4UXp+Na3vhUUQX6zhDMYJ8b08MMPt+9///tNn+f8OS/37uEF4LuMLwovXkHuleeee85OO+00+8EPfrDbPvldccwoVPxOOYavfOUr4d5z5QUP1RNPPBGeAdwvbBtlgf3z++R3yT0iuj9SALopaOH8OBEWCxcutP/8z/8MbstT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";" alt="Watermark Logo">
</body>
</html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Could not generate PDF.");
    }
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <HeaderWithOutBS title="Load Expense Calculator" />

        <View style={styles.container}>
          {/* Other components */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "blue" }]}
            onPress={generatePDF}
          >
            <Text style={styles.buttonText}>Download PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{item.load_name}</Text>
          </View>
          <View style={styles.balanceContainer}>
            <View style={[styles.box, { marginRight: 10 }]}>
              <Text style={styles.boxTitle}>
                ₹ {loadPrice}
              </Text>
              <Text style={styles.boxValue}>Credit amount</Text>
            </View>
            <View style={[styles.box, { marginRight: 10 }]}>
              <Text style={styles.boxTitle}>
                ₹ {initalCash.cashOut}
              </Text>
              <Text style={styles.boxValue}>Debit amount</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>₹ {initalCash.cashIn}</Text>
              <Text style={styles.boxValue}>Available balance</Text>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: 'green' }]}
              onPress={() => handleButtonPress("Credit entry")}
            >
              <Text style={styles.buttonText}>Credit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button1}
              onPress={() => handleButtonPress("Debit entry")}
            >
              <Text style={styles.buttonText}>Debit</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ExpenseHistory cashFlowExpenseHistory={cashFlowExpenseHistory} />
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{cashStatus}</Text>
            <TextInput
              style={[styles.input, errorFields.name && styles.inputError]}
              placeholder="Name"
              value={modalValues.name}
              onChangeText={(text) => handleInputChange("name", text)} // Use lowercase
            />

            <TextInput
              style={[styles.input, errorFields.amount && styles.inputError]}
              placeholder="Amount"
              keyboardType="number-pad"
              value={modalValues.amount}
              onChangeText={(text) => handleInputChange("amount", text)} // Use lowercase
            />

            <TextInput
              style={[styles.input, errorFields.details && styles.inputError]}
              placeholder="Description"
              value={modalValues.description}
              onChangeText={(text) => handleInputChange("description", text)} // Use lowercase
            />

            <TouchableOpacity style={[styles.applyButton, { backgroundColor: "#24a0ed" }]} onPress={handleCashInOut}>
              <Text style={styles.applyButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.applyButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    padding: 20,
    backgroundColor: "#f3f3f3",
    elevation: 5
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: COLORS.primary,
    textAlign: "center",
  },
  balanceContainer: {
    flexDirection: "row", // Arrange children horizontally
    paddingHorizontal: 0,
    marginTop: 10,
  },
  box: {
    flex: 1,
    height: 100,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally,
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    paddingHorizontal: 10,

  },
  boxValue: {
    fontSize: 12,
    color: COLORS.brand,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row", // Arrange children horizontally
    justifyContent: "center", // Center children horizontally
    marginTop: 20,

  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 50,
    marginHorizontal: 10,
  },
  button1: {
    backgroundColor: COLORS.brand,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 50,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },
  titleContainer: {
    backgroundColor: "#fff", // Change to desired background color
    padding: 10, // Add padding
    borderRadius: 5, // Optional: Add border radius
    marginBottom: 10, // Add some margin below the title

  },
});

export default LoadExpenseCalculator;
