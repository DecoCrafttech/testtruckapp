import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    ScrollView
} from "react-native";
import React, { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons"; // For clear icon
import TruckCard from "./TruckCard";



const PaginationComponent = ({
    search,
    setSearch,
    page,
    setPage,
    dataLimit,
    setDataLimit,
    showingData,
    setShowingData,
    showingDataLoading,
    setShowingDataLoading,
    getAllData,
    data1,
    selectedValue,
    status,
    handlePagination,
    totalRecords,
    searchQuery,
    setSearchQuery,
    isFiltered,
    applyFilterPagination,
    applyFilter,
    setApplyFilterPagination,
    availableTruckPage,
    isBuyAndSellShowingData,
    renderBuyAndSellData
}) => {
    const totalPages = Math.ceil(totalRecords / dataLimit) || 1;

    useEffect(() => {
        if (isFiltered && applyFilterPagination === false) {
            setPage(1); // ✅ Reset to first page when search or data limit changes
            getAllData(searchQuery ? searchQuery : search, 1, dataLimit);
        }
    }, [search, dataLimit, totalRecords]); // ✅ Include totalRecords in dependency array



    return (
        <View style={styles.container}>
            {showingDataLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size={"large"} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer}>


                    {
                        isBuyAndSellShowingData ?
                            renderBuyAndSellData
                            :

                            showingData.length > 0 ? (
                                showingData.map((item, index) => (
                                    <TruckCard
                                        key={index}
                                        selectedValue={selectedValue}
                                        post={item.post}
                                        profileName={item.profileName}
                                        companyName={item.companyName}
                                        transportName={item.transportName}
                                        title={item.title}
                                        fromLocation={item.fromLocation}
                                        toLocation={item.toLocation}
                                        labels={item.labels}
                                        description={item.description}
                                        onButton1Press={item.onButton1Press}
                                        onButton2Press={item.onButton2Press}
                                        status={status}
                                        updatedTime={item.updatedTime}
                                        isAadhaarVerified={item.isAadhaarVerified}
                                        availableTruckPage={availableTruckPage}
                                        truckSize={item.truckSize}
                                        nameOfTheTransport={item.nameOfTheTransport}
                                    />
                                ))
                            ) : (
                                <Text style={styles.noData}>No loads found</Text>
                            )

                    }

                    {/* Footer Section */}
                    <View style={styles.footer}>
                        {/* Data Limit Dropdown */}
                        <View style={styles.entriesContainer}>
                            <Text style={styles.label}>Show:</Text>
                            <Picker
                                selectedValue={dataLimit}
                                style={styles.entriesPicker}
                                onValueChange={(itemValue) => {
                                    if (applyFilterPagination) {
                                        applyFilter("", 1, itemValue)
                                        setDataLimit(itemValue); // ✅ Ensure dataLimit updates before applying filter

                                    } else {
                                        setDataLimit(itemValue);
                                        setPage(1); // Reset to first page when limit changes
                                    }
                                }}
                            >
                                <Picker.Item label="10" value={10} />
                                <Picker.Item label="20" value={20} />
                                <Picker.Item label="50" value={50} />
                            </Picker>
                        </View>

                        {/* Pagination Controls */}
                        <View style={styles.paginationContainer}>
                            <TouchableOpacity
                                style={[styles.pageButton, page === 1 && styles.disabledButton]}
                                onPress={() => {
                                    setPage((prevPage) => {
                                        const newPage = Math.max(1, prevPage - 1); // Ensure it doesn’t go below 1
                                        if (applyFilterPagination) {
                                            applyFilter("", newPage, dataLimit); // Use the updated page value
                                        }
                                        return newPage;
                                    });
                                }}
                                disabled={page === 1}
                            >
                                <Text style={styles.pageText}>«</Text>
                            </TouchableOpacity>

                            <Text style={styles.pageNumber}>
                                Page {page} of {totalPages}
                            </Text>

                            <TouchableOpacity
                                style={[
                                    styles.pageButton,
                                    page >= totalPages && styles.disabledButton,
                                ]}
                                onPress={() => {
                                    setPage((prevPage) => {
                                        const newPage = Math.min(prevPage + 1, totalPages); // Ensure it doesn’t go beyond totalPages
                                        if (applyFilterPagination) {
                                            applyFilter("", newPage, dataLimit); // Use the updated page value
                                        }
                                        return newPage;
                                    });
                                }}
                                disabled={page >= totalPages}
                            >
                                <Text style={styles.pageText}>»</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: "#f5f5f5" },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 600 },
    scrollContainer: { paddingBottom: 20 },
    noData: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#888" },
    footer: {
        marginTop: 20,
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
        flexDirection: 'row',
        justifyContent: "space-between"
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

export default PaginationComponent;
