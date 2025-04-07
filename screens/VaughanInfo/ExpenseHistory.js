import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS } from "../../constants";
import { Ionicons } from "@expo/vector-icons";

const ExpenseHistory = ({ cashFlowExpenseHistory, handleEdit, handleDelete }) => {
  const [filteredData, setFilteredData] = useState(cashFlowExpenseHistory);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterAmount, setFilterAmount] = useState("");
  const [filterDescription, setFilterDescription] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  useEffect(() => {
    filterData();
  }, [cashFlowExpenseHistory, filterType, filterAmount, filterDescription, fromDate, toDate]);

  const filterData = () => {
    let data = cashFlowExpenseHistory;

    if (filterType) data = data.filter((item) => item.cash_flow_type === filterType);
    if (filterAmount) data = data.filter((item) => item.amount.toString().includes(filterAmount));
    if (filterDescription)
      data = data.filter((item) => item.cash_flow_name.toLowerCase().includes(filterDescription.toLowerCase()));

    if (fromDate) {
      data = data.filter((item) => new Date(item.updt).setHours(0, 0, 0, 0) >= new Date(fromDate).setHours(0, 0, 0, 0));
    }
    if (toDate) {
      data = data.filter((item) => new Date(item.updt).setHours(0, 0, 0, 0) <= new Date(toDate).setHours(0, 0, 0, 0));
    }

    setFilteredData(data);
  };

  const resetFilters = () => {
    setFilterType("");
    setFilterAmount("");
    setFilterDescription("");
    setFromDate(null);
    setToDate(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Transaction History</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="filter" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {filteredData.length === 0 ? (
        <View style={[styles.centeredView, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.centeredText}>No Transaction History found</Text>
        </View>
      ) : (
        <ScrollView style={styles.root}>
          {filteredData.map((item, index) => (
            <View key={item.id ? item.id.toString() : index.toString()}>
              <View style={styles.rowContainer}>
                {/* Left Side - Text Data */}
                <View style={styles.content}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.name}>{item.cash_flow_name}</Text>
                  <Text style={item.cash_flow_type === "IN" ? styles.addMoney : styles.outMoney}>
                    ₹ {item.amount}
                  </Text>
                  <Text style={styles.time}>{item.updt}</Text>
                  <Text style={styles.closingBlancetext}>Available balance: ₹ {item.closing_balance}</Text>
                </View>

                {/* Right Side - Edit & Delete Icons */}
                <View style={styles.iconContainer}>
                  <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Ionicons name="create-outline" size={24} color="blue" style={styles.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Ionicons name="trash-outline" size={24} color="red" style={styles.icon} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Separator */}
              <View style={styles.separator} />
            </View>
          ))}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Filter Transactions</Text>

                <View style={styles.pickerContainer}>
                  <Picker selectedValue={filterType} onValueChange={setFilterType} style={styles.picker}>
                    <Picker.Item label="All" value="" />
                    <Picker.Item label="Credit" value="IN" />
                    <Picker.Item label="Debit" value="OUT" />
                  </Picker>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Enter Amount"
                  keyboardType="numeric"
                  value={filterAmount}
                  onChangeText={setFilterAmount}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter Description"
                  value={filterDescription}
                  onChangeText={setFilterDescription}
                />

                <TouchableOpacity onPress={() => setShowFromDatePicker(true)} style={styles.datePicker}>
                  <Text style={styles.dateText}>
                    {fromDate ? new Date(fromDate).toISOString().split("T")[0] : "From Date"}
                  </Text>
                </TouchableOpacity>
                {showFromDatePicker && (
                  <DateTimePicker
                    value={fromDate ? new Date(fromDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowFromDatePicker(false);
                      if (selectedDate) setFromDate(selectedDate);
                    }}
                  />
                )}

                <TouchableOpacity onPress={() => setShowToDatePicker(true)} style={styles.datePicker}>
                  <Text style={styles.dateText}>
                    {toDate ? new Date(toDate).toISOString().split("T")[0] : "To Date"}
                  </Text>
                </TouchableOpacity>
                {showToDatePicker && (
                  <DateTimePicker
                    value={toDate ? new Date(toDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowToDatePicker(false);
                      if (selectedDate) setToDate(selectedDate);
                    }}
                  />
                )}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity onPress={resetFilters} style={styles.buttonReset}>
                    <Text style={styles.buttonText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.buttonApply}>
                    <Text style={styles.buttonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>




    </View>
  );
};




const styles = StyleSheet.create({
  container: { flex: 1 },
  root: { backgroundColor: "#ffffff", paddingHorizontal: 15 },
  header: { flexDirection: "row", justifyContent: "space-between", borderBottomColor: '#000', borderBottomWidth: 0.5, paddingHorizontal: 25, paddingVertical: 15, paddingTop: 20 },
  headerText: { fontSize: 18, fontWeight: "bold", },
  content: { paddingHorizontal: 0, },
  separator: { height: 1, backgroundColor: "#CCCCCC" },
  time: { fontSize: 11, color: "#808080" },
  addMoney: { fontSize: 14, color: "green" },
  outMoney: { fontSize: 14, color: "red" },
  category: { fontSize: 16, fontWeight: "bold", color: COLORS.primary },
  closingBlancetext: { color: "#0080FF" },
  centeredView: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  centeredText: { fontSize: 18, color: "#808080" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "80%", padding: 20, backgroundColor: "white", borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
    marginVertical: 5,
  },
  picker: {
    height: 50,
    width: "100%",
  }, datePicker: { padding: 12, backgroundColor: "#f0f0f0", borderRadius: 5, marginVertical: 5 },
  dateText: { textAlign: "center" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  buttonReset: { backgroundColor: "red", padding: 10, borderRadius: 5, width: '45%', },
  buttonApply: { backgroundColor: "green", padding: 10, borderRadius: 5, width: '45%', },
  buttonText: { color: "white", fontWeight: "bold", textAlign: 'center' },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 5,
    backgroundColor: "#f9f9f9",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    // borderBottomWidth: 1,
    // borderBottomColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 5,
    // shadowColor: "#000",
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // elevation: 3,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginLeft: 10,
  },
});

export default ExpenseHistory;
