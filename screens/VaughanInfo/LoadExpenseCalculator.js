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
import RNHTMLtoPDF from "react-native-html-to-pdf";


const LoadExpenseCalculator = ({ route }) => {

  console.log("RNHTMLtoPDF:", RNHTMLtoPDF);


  const { item } = route.params;

  const { isLoading, setIsLoading } = useContext(LoadNeedsContext)

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cashStatus, setCashStatus] = useState("");
  const [modalValues, setModalValues] = useState({
    name: "",
    category: "",
    amount: "",
  });
  const [errorFields, setErrorFields] = useState({
    name: false,
    amount: false,
  });

  const toggleModal = (cash) => {
    setCashStatus(cash);
    setIsModalVisible(!isModalVisible);
    setModalValues({
      name: "",
      amount: "",
    });
    setErrorFields({
      name: false,
      amount: false,
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
            description : "",
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
      // Define HTML structure for the PDF
      const htmlContent = `
        <html>
          <body>
            <h1>Load Expense Report</h1>
            <p>Load Name: ${item.load_name}</p>
            <p>Credit Amount: ₹${loadPrice}</p>
            <p>Debit Amount: ₹${initalCash.cashOut}</p>
            <p>Available Balance: ₹${initalCash.cashIn}</p>
            <h2>Expense History:</h2>
            <table border="1" style="width:100%; text-align:left;">
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
              ${cashFlowExpenseHistory
                .map(
                  (entry) =>
                    `<tr>
                      <td>${entry.cash_flow_name}</td>
                      <td>₹${entry.amount}</td>
                      <td>${entry.cash_flow_type}</td>
                    </tr>`
                )
                .join("")}
            </table>
          </body>
        </html>
      `;

      // console.log("htmlContent",htmlContent)


      // Generate PDF 
      const options = {
        html: htmlContent,
        fileName: "Load_Expense_Report",
        directory: "Documents",
      };

console.log("options",options)
console.log("RNHTMLtoPDF",RNHTMLtoPDF)

      const file = await RNHTMLtoPDF.convert(options);
      console.log("file",file)
      Alert.alert("Success", `PDF saved to ${file.filePath}`);
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

            {/* <TextInput
              style={[styles.input, errorFields.details && styles.inputError]}
              placeholder="Details"
              value={modalValues.details}
              onChangeText={(text) => handleInputChange("details", text)} // Use lowercase
            /> */}

            <TouchableOpacity style={styles.applyButton} onPress={handleCashInOut}>
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
    paddingHorizontal : 10,
    
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
