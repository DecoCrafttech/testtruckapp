import React, { useEffect, useRef, useState } from "react";
import { COLORS } from "../../constants";
import {
    View,
    Text,
    Image,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import axiosInstance from "../../services/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import Constants from 'expo-constants'
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Marker } from "react-native-maps";


const PetrolBunkMyPosts = ({ allData, fetchData }) => {

    // google api key
    const googleApiKey = Constants.expoConfig?.extra?.REACT_APP_GOOGLE_PLACES_KEY

    const [modalVisible, setModalVisible] = useState(false);
    const [pageRefresh, setPageRefresh] = useState(false)
    const [saveChangesLoading, setSaveChangesLoading] = useState(false)
    const [spinner, setSpinner] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false)
    const [deleteItem, setDeleteItem] = useState({})

    const [locationModal, setLocationModal] = useState(false)
    const mapRef = useRef(null);
    const [region, setRegion] = useState({
        latitude: 20.5937,
        longitude: 78.9629,
        latitudeDelta: 10,
        longitudeDelta: 10,
    });



    const [amenities, setAmenities] = useState({
        wifi: false,
        drinkingWater: false,
        toilet: false,
        parking: false,
        atm: false,
        freeAir: false,
        oilChangeService: false,
        foodCourt: false,
        evCharging: false,
        lodging: false,
        restArea: false,
        firstAidFacility: false,
    });

    const labels = [
        "Wifi",
        "Drinking Water",
        "Toilet",
        "Parking",
        "ATM",
        "Free Air",
        "Oil Change Service",
        "Food Court",
        "EV Charging",
        "Lodging",
        "Rest Area",
        "First Aid Facility",
    ];


    const capitalizedAmenities = Object.fromEntries(
        labels.map(label => [
            label,
            amenities[
            Object.keys(amenities).find(key =>
                key.toLowerCase() === label.toLowerCase().replace(/\s+/g, "")
            )
            ]
        ])
    );

    const toggleCheckbox = (key) => {
        setAmenities((prevState) => ({
            ...prevState,
            [key]: !prevState[key],  // Toggle the boolean value for the selected key
        }));
    };

    const [editedData, setEditedData] = useState({
        id: "",
        bunkName: "",
        ownerName: "",
        location: "",
        discount: "",
        amenities: []
    });


    const handleYes = async () => {

        try {
            const deleteParameters = {
                "bunk_id": deleteItem.bunk_id
            };
            const response = await axiosInstance.post(
                `/delete_petrol_bunk`,
                deleteParameters
            );
            if (response.data.error_code === 0) {
                fetchData("petrol_bunks");
            } else {

            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleCancel = () => {
        setDeleteModal(false);
    };


    const saveChanges = async () => {

        const capitalizedAmenities = Object.fromEntries(
            labels.map(label => [
                label,
                amenities[
                Object.keys(amenities).find(key =>
                    key.toLowerCase() === label.toLowerCase().replace(/\s+/g, "")
                )
                ]
            ])
        );


        const activeAmenities = Object.entries(capitalizedAmenities)
            .filter(([key, value]) => value === true)
            .map(([key]) => key);
        console.log("Active Amenities:", activeAmenities);


        try {
            const postData = {
                "user_id": await AsyncStorage.getItem("user_id"),
                "petrol_bunk_id": editedData.id,
                "petrol_bunk_name": editedData.bunkName,
                "owner_name": editedData.ownerName,
                "location": editedData.location,
                "latitude": `${region.latitude}`,
                "longitude": `${region.longitude}`,
                "discount": `${editedData.discount}`,
                "amenities": activeAmenities
            };

            console.log("amenties", amenities)
            console.log("capitalizedAmenities", capitalizedAmenities)
            console.log("postData", postData)

            setSaveChangesLoading(true)
            setSpinner(true);

            const response = await axiosInstance.post("/petrol_bunk_entry", postData);
            if (response.data.error_code === 0) {
                Alert.alert("Petrol bunk updated successfully!");
                setPageRefresh(!pageRefresh)
                setModalVisible(false);
                fetchData("petrol_bunks")
                setSaveChangesLoading(false)
            } else {
                setSaveChangesLoading(false)
                Alert.alert("Failed to add post. Please try again later.");
            }
        } catch (error) {
            setSaveChangesLoading(false)
            console.error("Error adding post:", error);
            Alert.alert("Failed to add post. Please try again later.");
        } finally {
            setSaveChangesLoading(false)
            setSpinner(false);
        }
    };

    const handleEditPress = async (item) => {
        const updatedAmenities = Object.fromEntries(
            Object.keys(amenities).map((key) => [
                key,
                item.amenities.some(amenity =>
                    amenity.toLowerCase().replace(/\s+/g, "") === key.toLowerCase().replace(/\s+/g, "")
                )
            ])
        );
        setAmenities(updatedAmenities); // Update checkboxes based on selected amenities
        setEditedData({
            id: item.bunk_id,
            bunkName: item.petrol_bunk_name,
            ownerName: item.owner_name,
            location: item.location,
            discount: item.discount[0],
            amenities: item.amenities, // Store the array of amenities
        });
        setModalVisible(true);
    };



    const handleLocation = (data, details) => {
        let country = '';
        let state = '';
        let city = '';

        if (details.address_components) {
            details.address_components.forEach(component => {
                if (component.types.includes('country')) {
                    country = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                }
                if (component.types.includes('locality')) {
                    city = component.long_name;
                }
            });
        }
        setEditedData({ ...editedData, location: `${city}, ${state}` })
        setLocationModal(false)
        const { lat, lng } = details.geometry.location;
        setRegion({
            ...region,
            latitude: lat,
            longitude: lng,
        });

        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        }
    };



    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.item}>
                <View style={styles.itemContent}>
                    <View style={styles.tableContainer}>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableLabel}>Bunk name :</Text>
                            <Text style={styles.tableValue}>{item.petrol_bunk_name}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableLabel}>Owner name :</Text>
                            <Text style={styles.tableValue}>{item.owner_name}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableLabel}>Location :</Text>
                            <Text style={styles.tableValue}>{item.location}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableLabel}>Latitude :</Text>
                            <Text style={styles.tableValue}>{item.latitude}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableLabel}>Longitude :</Text>
                            <Text style={styles.tableValue}>{item.longitude}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableLabel}>Discount :</Text>
                            <Text style={styles.tableValue}>{item.discount}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableLabel}>Amenities :</Text>
                            <Text style={styles.tableValue}>{item.amenities.join(", ")}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleEditPress(item)}
                >
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                        setDeleteModal(true)
                        setDeleteItem(item)
                    }}
                >
                    <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );


    const handleMapPress = (e) => {
        const { coordinate } = e.nativeEvent;
    
        // Set a smaller delta for zooming in
        const zoomedRegion = {
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            latitudeDelta: 0.01, // Adjust this value for zoom level
            longitudeDelta: 0.01, // Adjust this value for zoom level
        };
    
        // Update the region state with the new coordinates and zoom level
        setRegion(zoomedRegion);
    
        // Reverse geocode the selected location to get the address
        reverseGeocode(coordinate.latitude, coordinate.longitude);
    };

    const reverseGeocode = async (latitude, longitude) => {
        try {
            const response = await axiosInstance.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`
            );
            if (response.data.status === 'OK') {
                const address = response.data.results[0].formatted_address;
                setEditedData({ ...editedData, location: address }); // Update editedData.location
            }
        } catch (error) {
            console.error('Error fetching address:', error);
        }
    };




    return (
        <View style={styles.container}>
            <FlatList
                data={[...allData].reverse()} // Create a new array to avoid mutating state
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent} >
                        <Text style={styles.modalTitle}>Edit bunk</Text>
                        <ScrollView style={{ width: '100%', height: "70%" }} >

                            <TextInput
                                style={styles.input}
                                placeholder="Bunk name"
                                value={editedData.bunkName}
                                onChangeText={(text) => setEditedData({ ...editedData, bunkName: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Owner name"
                                value={editedData.ownerName}
                                onChangeText={(text) => setEditedData({ ...editedData, ownerName: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Location"
                                value={editedData.location}
                                onPress={() => setLocationModal(true)}
                            />


                            <MapView
                                ref={mapRef}
                                style={styles.map}
                                region={region}
                                onPress={handleMapPress} // Add onPress event here
                            >
                                <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
                            </MapView>


                            {/* <MapView
                                ref={mapRef}
                                style={styles.map}
                                region={region}
                            >
                                <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
                            </MapView> */}

                            {Object.entries(amenities).map(([key, value], index) => (
                                <TouchableOpacity
                                    key={key}
                                    style={styles.checkboxContainer}
                                    onPress={() => toggleCheckbox(key)}
                                >
                                    <View style={styles.checkbox}>
                                        {value && <View style={styles.checkboxTick} />}
                                    </View>
                                    <Text style={styles.label}>{labels[index] ? labels[index] : key}</Text>
                                </TouchableOpacity>
                            ))}

                            <TextInput
                                style={styles.input}
                                placeholder="Discount"
                                value={editedData.discount}
                                onChangeText={(text) => setEditedData({ ...editedData, discount: text })}

                            />
                        </ScrollView>

                        <View style={styles.modalButtons}>

                            {
                                saveChangesLoading ?
                                    <TouchableOpacity
                                        style={[styles.saveButton, { opacity: saveChangesLoading ? 0.5 : 1 }]}
                                        disabled
                                    >
                                        <Text style={styles.saveButtonText}>
                                            <ActivityIndicator size='small' color="#fff" />
                                        </Text>
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={saveChanges}
                                    >
                                        <Text style={styles.saveButtonText}>Save Changes</Text>
                                    </TouchableOpacity>
                            }

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => {
                                    setModalVisible(false)
                                }}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            {/* Delete Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={deleteModal}
                onRequestClose={() => setDeleteModal(false)}
            >
                <DeleteConfirmationModal handleYes={handleYes} handleCancel={handleCancel} />
            </Modal>


            {/* Location Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={locationModal}
            >
                <View style={styles.locationModalContainer}>
                    <View style={styles.locationModalContent}>
                        <Text style={styles.locationModalTitle}>Location</Text>


                        <View style={styles.locationContainer}>
                            <GooglePlacesAutocomplete
                                placeholder="Search location"
                                onPress={handleLocation}
                                textInputProps={{
                                    autoFocus: true,
                                }}
                                query={{
                                    key: googleApiKey,
                                    language: 'en',
                                    components: 'country:in',
                                }}
                                fetchDetails={true}
                                styles={{
                                    textInputContainer: styles.locationTextInputContainer,
                                    textInput: styles.locationTextInput
                                }}
                            />
                        </View>

                        <TouchableOpacity style={styles.locationCloseButton} onPress={() => setLocationModal(false)}>
                            <Text style={styles.locationApplyButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 10,
    },
    card: {
        marginTop: 10,
        marginHorizontal: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 20,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    itemImage: {
        width: 150,
        height: 150,
        borderRadius: 30,
        margin: 'auto',
        marginBottom: 20,
    },
    itemContent: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    tableContainer: {
        marginTop: 10,
    },
    tableRow: {
        flexDirection: "row",
        marginBottom: 5,
    },
    tableLabel: {
        fontWeight: "bold",
        marginRight: 5,
    },
    tableValue: {
        flex: 1,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginTop: 5,
    },
    button: {
        flex: 1,
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 5,
        marginRight: 10,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: COLORS.brand,
        paddingVertical: 15,
        borderRadius: 5,
        marginLeft: 10,
    },
    buttonText: {
        textAlign: "center",
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        alignSelf: "stretch",
        alignItems: "center",
        width: "100%",
    },
    saveButtonText: {
        color: COLORS.white,
        textAlign: "center",
    },
    closeButton: {
        backgroundColor: COLORS.brand,
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        alignSelf: "stretch",
        alignItems: "center",
        width: "100%",
    },
    closeButtonText: {
        color: COLORS.white,
        textAlign: "center",
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    modalImageEditIcon: {
        position: 'absolute',
        right: "0%",
        bottom: "0%",
    },
    multipleImageContainer: {
        flexDirection: 'row',
        gap: 5,
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginHorizontal: 10
    },

    // Feedbackmodal
    feedbackModalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    feedbackModalContent: {
        backgroundColor: COLORS.white,
        width: "80%",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    feedbackHeader: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    feedbackButtonContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    feedbackButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        backgroundColor: COLORS.gray,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    feedbackSelectedButton: {
        backgroundColor: COLORS.primary,
    },
    feedbackButtonText: {
        color: COLORS.white,
        fontSize: 16,
    },
    feedbackInputContainer: {
        width: "100%",
        marginBottom: 20,
    },
    feedbackLabel: {
        fontSize: 18,
        marginBottom: 10,
    },
    feedbackInput: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: COLORS.gray,
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    feedbackSubmitButton: {
        backgroundColor: COLORS.primary,
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: "100%",
        alignItems: "center",
    },
    feedbackSubmitButtonText: {
        color: COLORS.white,
        fontSize: 16,
    },
    feedbackCloseButton: {
        backgroundColor: COLORS.brand,
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: "100%",
        alignItems: "center",
    },
    feedbackCloseButtonText: {
        color: COLORS.white,
        fontSize: 16,
    },
    starContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 20,
    },
    star: {
        marginHorizontal: 5,
    },

    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: COLORS.primary,
        marginRight: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxTick: {
        width: 12,
        height: 12,
        backgroundColor: COLORS.primary,
    },
    locationModalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    locationModalContent: {
        backgroundColor: COLORS.white,
        padding: 20,
        width: "90%",
        borderRadius: 10,
        elevation: 5,
        height: "90%"
    },
    locationModalTitle: {
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
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        height: 40,
    },
    locationCloseButton: {
        backgroundColor: "#8a1c33",
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    locationApplyButtonText: {
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
    },
    map: {
        flex: 1,
        width: '100%',
        height: 250, // Adjust this as needed
        marginBottom: 20
    },


});

export default PetrolBunkMyPosts;


