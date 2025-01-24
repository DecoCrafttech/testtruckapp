import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { COLORS } from "../../constants";

const ExpenseHistory = ({ cashFlowExpenseHistory }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(cashFlowExpenseHistory);

  // Update filteredData whenever cashFlowExpenseHistory changes
  useEffect(() => {
    setFilteredData(cashFlowExpenseHistory);
  }, [cashFlowExpenseHistory]);


  const renderContent = () => {
    if (filteredData.length === 0) {


      return (
        <View style={styles.centeredView}>
          <Text style={styles.centeredText}>No Transaction History found</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <FlatList
            style={styles.root}
            data={filteredData}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.container}>
                <View style={styles.content}>
                  <View style={styles.contentHeader}>
                    <Text style={styles.category}>{item.category}</Text>
                  </View>
                  <View style={styles.contentHeader}>
                    <Text style={styles.name}>{item.cash_flow_name}</Text>
                    <Text style={item.cash_flow_type === "IN" ? styles.addMoney : styles.outMoney}>
                      ₹ {item.amount}
                    </Text>
                  </View>
                  <View style={styles.contentHeader}>
                    <Text style={styles.time}>{item.updt}</Text>
                  </View>
                  <View style={styles.contentHeader}>
                    <Text style={styles.closingBlancetext}>Availabe balance</Text>
                    <Text style={styles.time}>₹ {item.closing_balance}</Text>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      );
    }
  };

  return renderContent();
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#ffffff",
    marginTop: 12,
    paddingHorizontal: 15
  },
  container: {
    flex: 1,
  },
  content: {
    marginLeft: 15,
    flex: 1,
  },
  contentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 5
  },
  separator: {
    height: 1,
    backgroundColor: "#CCCCCC",
  },
  time: {
    fontSize: 11,
    color: "#808080",
  },
  addMoney: {
    fontSize: 14,
    color: "green",
  },
  outMoney: {
    fontSize: 14,
    color: "red",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  category: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  closingBlancetext: {
    color: '#0080FF',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredText: {
    fontSize: 18,
    color: "#808080",
  },
  searchInput: {
    height: 50,
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
});

export default ExpenseHistory;
