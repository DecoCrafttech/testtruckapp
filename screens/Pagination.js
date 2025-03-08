import React, { useState, useEffect } from "react";
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";

const Pagination = ({ data1, handlePagination, totalRecords }) => {

    const [page, setPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [itemsPerPageModalVisible, setItemsPerPageModalVisible] = useState(false);

    // Fetch API data whenever page or itemsPerPage changes
    useEffect(() => {
        handlePagination(itemsPerPage, page);
    }, [itemsPerPage, page]);


    console.log("Current Page:", page, "Items Per Page:", itemsPerPage);


    return (
        <View style={styles.container}>
            {/* FlatList for displaying paginated data */}
            <FlatList
                key={itemsPerPage}
                data={data1.slice(page * itemsPerPage, Math.min((page + 1) * itemsPerPage, totalRecords))}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text>{item.name}</Text>
                    </View>
                )}
            />

            {/* Pagination Controls */}
            <TouchableOpacity
                onPress={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={page === 0}
                style={[styles.button, page === 0 && styles.disabledButton]}
            >
                <Text>Previous</Text>
            </TouchableOpacity>

            <Text>Page {page + 1}</Text>

            <TouchableOpacity
                onPress={() => setPage((prev) => prev + 1)}
                disabled={(page + 1) * itemsPerPage >= totalRecords}
                style={[styles.button, (page + 1) * itemsPerPage >= totalRecords && styles.disabledButton]}
            >
                <Text>Next</Text>
            </TouchableOpacity>

            {/* Button to open Modal */}
            <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setItemsPerPageModalVisible(true)}
            >
                <Text>Select Entries per Page ({itemsPerPage})</Text>
            </TouchableOpacity>

            {/* Modal for selecting entries per page */}
            <Modal visible={itemsPerPageModalVisible} transparent={true} animationType="slide">
                <View style={styles.itemsPerPageModalContainer}>
                    <View style={styles.itemsPerPageModalContent}>
                        <Text style={styles.itemsPerPageModalTitle}>Select Entries per Page</Text>

                        {[1, 2, 3, 4, 5].map((value) => (
                            <TouchableOpacity
                                key={value}
                                style={styles.itemsPerPageModalButton}
                                onPress={() => {
                                    setItemsPerPage(value);
                                    setPage(0);
                                    setItemsPerPageModalVisible(false);
                                }}
                            >
                                <Text>{value} Items</Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.itemsPerPageModalClose}
                            onPress={() => setItemsPerPageModalVisible(false)}
                        >
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    item: { padding: 15, borderBottomWidth: 1, borderColor: "#ddd" },
    pagination: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
    button: { padding: 10, backgroundColor: "#ddd", borderRadius: 5 },
    disabledButton: { backgroundColor: "#ccc" },
    selectButton: {
        marginTop: 20, padding: 10, backgroundColor: "#008CBA",
        alignItems: "center", borderRadius: 5
    },
    /* Modal Styles */
    itemsPerPageModalContainer: {
        flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)"
    },
    itemsPerPageModalContent: {
        backgroundColor: "#fff", padding: 20, borderRadius: 10, width: 250, alignItems: "center"
    },
    itemsPerPageModalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    itemsPerPageModalButton: { padding: 10, marginVertical: 5, backgroundColor: "#ddd", width: "100%", alignItems: "center" },
    itemsPerPageModalClose: { marginTop: 10, padding: 10, backgroundColor: "#FF4D4D", width: "100%", alignItems: "center" }
});

export default Pagination;