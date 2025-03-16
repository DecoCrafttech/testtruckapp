import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView
} from "react-native";
import React, { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons"; // For clear icon

const InsuranceCard = ({ data }) => (
  <View style={styles.card}>
    <Text style={styles.company}>{data.company_name}</Text>
    <Text>From: {data.from_location}</Text>
    <Text>To: {data.to_location}</Text>
    <Text>Material: {data.material}</Text>
    <Text>Truck Type: {data.truck_body_type}</Text>
    <Text>Tyres: {data.no_of_tyres}</Text>
    <Text>Contact: {data.contact_no}</Text>
    <Text>Weight: {data.tone} tons</Text>
  </View>
);

const LoadList = () => {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dataLimit, setDataLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchLoadData(search, page, dataLimit);
  }, [search, page, dataLimit]);

  const fetchLoadData = (searchVal, pageNo, limit) => {
    setLoading(true);
    fetch("https://truck.truckmessage.com/all_load_details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_no: pageNo,
        data_limit: limit,
        search_val: searchVal,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          setLoads(json.data.load_data);
          setTotalRecords(parseInt(json.data.all_record_count));
        } else {
          setLoads([]);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  };

  const totalPages = Math.ceil(totalRecords / dataLimit);

  return (
    <View style={styles.container}>
      {/* Search Box with Clear Button */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBox}
          placeholder="Search..."
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setPage(1); // Reset to first page when searching
          }}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(""); setPage(1); }}>
            <MaterialIcons name="clear" size={24} color="gray" style={styles.clearIcon} />
          </TouchableOpacity>
        )}
      </View>

      {/* Load List */}
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={loads}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <InsuranceCard data={item} />}
          ListEmptyComponent={<Text style={styles.noData}>No loads found</Text>}
        />
      )}

      {/* Footer Section */}
      <View style={styles.footer}>
        {/* Entries Selection */}
        <View style={styles.entriesContainer}>
          <Text style={styles.label}>Show:</Text>
          <Picker
            selectedValue={dataLimit}
            style={styles.entriesPicker}
            onValueChange={(itemValue) => {
              setDataLimit(itemValue);
              setPage(1);
            }}
          >
            <Picker.Item label="1" value={1} />
            <Picker.Item label="2" value={2} />
            <Picker.Item label="3" value={3} />
          </Picker>
        </View>

        {/* Pagination Controls */}
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[styles.pageButton, page === 1 && styles.disabledButton]}
            onPress={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <Text style={styles.pageText}>«</Text>
          </TouchableOpacity>

          <Text style={styles.pageNumber}>Page {page} of {totalPages}</Text>

          <TouchableOpacity
            style={[styles.pageButton, page >= totalPages && styles.disabledButton]}
            onPress={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            <Text style={styles.pageText}>»</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f5f5f5" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  searchBox: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  clearIcon: {
    padding: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  company: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  noData: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#888" },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  entriesContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 5,
    borderRadius: 8,
  },

  entriesPicker: {
    height: 30,
    width: 100,
    marginLeft: 5,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },

  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 8,
  },

  pageButton: {
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: "#007bff",
    borderRadius: 8,
    marginHorizontal: 5,
  },

  disabledButton: {
    backgroundColor: "#ccc",
  },

  pageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  pageNumber: {
    fontSize: 14,
    fontWeight: "bold",
    marginHorizontal: 1,
    color: "#333",
  },

});


export default LoadList;
