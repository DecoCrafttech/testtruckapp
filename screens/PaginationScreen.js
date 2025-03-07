import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

const PaginationScreen = ({ data, totalRecords, handlePagination }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debugging Logs
  useEffect(() => {
    console.log("Total Records:", totalRecords);
    console.log("Total Pages:", totalPages);
  }, [totalRecords, totalPages]);

  // Update total pages when totalRecords or itemsPerPage changes
  useEffect(() => {
    if (totalRecords > 0) {
      const newTotalPages = Math.ceil(totalRecords / itemsPerPage);
      console.log("New Total Pages:", newTotalPages);
      setTotalPages(newTotalPages);
    } else {
      setTotalPages(0);
    }
  }, [totalRecords, itemsPerPage]);

  // Reset current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages]);

  // Change page
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.paginationContainer}>
        {/* Items per page dropdown */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={itemsPerPage}
            style={styles.picker}
            onValueChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
              handlePagination(value, 1);
            }}
          >
            <Picker.Item label="1" value={1} />
            <Picker.Item label="2" value={2} />
            <Picker.Item label="3" value={3} />
            <Picker.Item label="5" value={5} />
          </Picker>
        </View>

        {/* Pagination Buttons */}
        <View style={styles.pageButtonContainer}>
          {totalPages > 0 ? (
            Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <TouchableOpacity
                key={pageNum}
                onPress={() => {
                  handlePagination(itemsPerPage, pageNum);
                  goToPage(pageNum);
                }}
                style={[styles.pageNumber, currentPage === pageNum && styles.selectedPage]}
              >
                <Text style={styles.pageText}>{pageNum}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text>No Pages</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  paginationContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: "grey",
    borderRadius: 5,
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: 120,
  },
  pageButtonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  pageNumber: {
    padding: 10,
    margin: 5,
    backgroundColor: "#eee",
    borderRadius: 5,
  },
  selectedPage: {
    backgroundColor: "#007bff",
  },
  pageText: {
    color: "#000",
    fontWeight: "bold",
  },
});

export default PaginationScreen;
