import React, { useContext, useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Alert,
    Text,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import HeaderWithOutBS from "../../components/HeaderWithOutBS";
import axiosInstance from "../../services/axiosInstance";
import { LoadNeedsContext } from "../../hooks/LoadNeedsContext";
import { useNavigation } from "@react-navigation/native";
import Constants from 'expo-constants'

import MapView, { Marker} from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";


const GOOGLE_API_KEY = "AIzaSyCLT-nqnS-13nBpe-mqzJVsRK7RZIl3I5s";


const PetrolBunkAdd = () => {

    // google api key
    const googleApiKey = Constants.expoConfig?.extra?.REACT_APP_GOOGLE_PLACES_KEY


    const navigation = useNavigation("")

    const { isLoading, setIsLoading } = useContext(LoadNeedsContext);

    const [spinner, setSpinner] = useState(false);

    const textInputRef = useRef(null); // Create a reference for the TextInput

    const [bunkName, setBunkName] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [discount, setDiscount] = useState("");
    const [location, setLocation] = useState("");

    const [bunkNameValid, setBunkNameValid] = useState(true);
    const [ownerNameValid, setOwnerNameValid] = useState(true);
    const [discountValid, setDiscountValid] = useState(true);
    const [amenitiesValid, setAmenitiesValid] = useState([]);
    const [locationValid, setLocationValid] = useState(true);

    const [locationModal, setLocationModal] = useState(false)

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
            [key]: !prevState[key],
        }));
    };


    const handleAddBunk = async () => {
        // Validate input fields
        if (
            bunkName.trim() === "" ||
            ownerName.trim() === "" ||
            discount.trim() === "" ||
            location.trim() === ""
        ) {
            Alert.alert("Please fill in all the fields.");
            setBunkNameValid(bunkName.trim() !== "");
            setOwnerNameValid(ownerName.trim() !== "");
            setDiscountValid(discount.trim() !== "");
            setLocationValid(location.trim() !== "")

            setSpinner(false);
            return;
        }


        // Prepare data to send
        const postData = {
            "petrol_bunk_name": bunkName,
            "owner_name": ownerName,
            "location": location,
            "latitude": `${region.latitude}`,
            "longitude": `${region.longitude}`,
            "discount": `${discount}`,
            "amenities": capitalizedAmenities
        };

        try {
            setSpinner(true);

            // Send POST request to your API endpoint
            const response = await axiosInstance.post("/petrol_bunk_entry", postData);
            if (response.data.error_code === 0) {
                console.log("response.data", response.data)

                Alert.alert("Post added successfully!");
                navigation.navigate("PetrolBunk")
            } else {
                Alert.alert("Failed to add post. Please try again later.");
            }
            // Optionally, reset form fields after successful submission



        } catch (error) {
            console.error("Error adding post:", error);
            Alert.alert("Failed to add post. Please try again later.");
        } finally {
            setSpinner(false);
        }
    };


    const [region, setRegion] = useState({
        latitude: 20.5937,
        longitude: 78.9629,
        latitudeDelta: 10,
        longitudeDelta: 10,
        // latitude: 37.78825,
        // longitude: -122.4324,
        // latitudeDelta: 0.0922,
        // longitudeDelta: 0.0421,

    });

    const mapRef = useRef(null);

    const handleLocationSelect = (data, details) => {


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


        setLocation(`${city}, ${state}`)
        setLocationModal(false)

        const { lat, lng } = details.geometry.location;

        console.log("lat,lon",lat,lng)

        setRegion({
            ...region,
            latitude: lat,
            longitude: lng,
        });

        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        }
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
            <View style={{ flex: 1, backgroundColor: COLORS.white }}>
                <HeaderWithOutBS title="Add Petrol Bunk" />

                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <View style={styles.textInputContainer}>
                        <Text style={styles.label}>Petrol bunk name</Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                !bunkNameValid && { borderColor: "red" },
                            ]}
                            placeholder="Enter bunk name"
                            onChangeText={setBunkName}
                            value={bunkName}
                        />

                        <Text style={styles.label}>Owner name</Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                !ownerNameValid && { borderColor: "red" },
                            ]}
                            placeholder="Enter owner name"
                            onChangeText={setOwnerName}
                            value={ownerName}
                        />
                        <Text style={styles.label}>Discount</Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                !discountValid && { borderColor: "red" },
                            ]}
                            placeholder="Enter discount"
                            onChangeText={setDiscount}
                            value={discount}
                            keyboardType="number-pad"
                        />

                        <Text style={[styles.label, { marginBottom: 20 }]}>Amenities</Text>

                        {Object.keys(amenities).map((key, index) => (
                            <TouchableOpacity
                                key={key}
                                style={styles.checkboxContainer}
                                onPress={() => toggleCheckbox(key)}
                            >
                                <View style={styles.checkbox}>
                                    {amenities[key] && <View style={styles.checkboxTick} />}
                                </View>
                                <Text style={styles.label}>{labels[index]}</Text>
                            </TouchableOpacity>
                        ))}

                        <Text style={styles.label}>Location</Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                !locationValid && { borderColor: "red" },
                            ]}
                            placeholder="Enter location"
                            value={location}
                            onPress={() => setLocationModal(true)}
                        />

                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            region={region}
                        >
                            <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
                        </MapView>

                    </View>

                    {spinner ? (
                        <TouchableOpacity style={styles.postButton}>
                            <ActivityIndicator color={COLORS.white} size="small" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.postButton} onPress={handleAddBunk}>
                            <Text style={styles.postButtonText}>Add Bunk</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>

            {/* From Location Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={locationModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Location</Text>


                        <View style={styles.locationContainer}>

                            <GooglePlacesAutocomplete
                                placeholder="Search for a location"
                                fetchDetails={true} // This ensures that you get more detailed information about the selected location
                                onPress={handleLocationSelect}
                                query={{
                                    key: googleApiKey, // Use your hardcoded key if Config is not working
                                    language: 'en',
                                    components: 'country:in',
                                }}
                                textInputProps={{
                                    autoFocus: true,
                                }}
                                styles={{
                                    textInputContainer: styles.locationTextInputContainer,
                                    textInput: styles.locationTextInput
                                }}
                            />

                            {/* <GooglePlacesAutocomplete
                                placeholder="Search location"
                                onPress={handleLocation}
                                textInputProps={{
                                    autoFocus: true,
                                }}
                                query={{
                                    key: googleApiKey, // Use your hardcoded key if Config is not working
                                    language: 'en',
                                    components: 'country:in',
                                }}
                                fetchDetails={true} // This ensures that you get more detailed information about the selected location
                                styles={{
                                    textInputContainer: styles.locationTextInputContainer,
                                    textInput: styles.locationTextInput
                                }}
                            /> */}
                        </View>


                        <TouchableOpacity style={styles.closeButton} onPress={() => setLocationModal(false)}>
                            <Text style={styles.applyButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>




        </SafeAreaView>
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
        // paddingVertical: 20,
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
        borderColor: COLORS.gray,
        borderRadius: 5,
        padding: 13,
        marginBottom: 10,
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
        width: "90%",
        borderRadius: 10,
        elevation: 5,
        height: "90%"
    },
    modalTitle: {
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
    closeButton: {
        backgroundColor: "#8a1c33",
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    applyButtonText: {
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
    },
    dropdown: {
        fontSize: 14,
        width: "100%",
        borderBottomColor: 'gray',
        paddingLeft: 12,
    },
    icon: {
        marginRight: 5,
    },
    mobileNumberInputBox: {
        width: "100%",
        height: 48,
        backgroundColor: "#fff",
        borderRadius: 5,
        borderColor: 'grey',
        borderWidth: 1,
        flexDirection: 'row'
    },
    placeholderStyle: {
        fontSize: 14,
        color: 'grey'
    },
    selectedTextStyle: {
        fontSize: 14,
    },
    iconStyle: {
        width: 20,
        height: 20,
        marginRight: 15,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 14,
    },
    itemContainerStyle: {

    },
    itemTextStyle: {
        fontSize: 14,
    },
    addButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    map: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: 250, // Adjust this as needed
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
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
    label: {
        fontSize: 16,
    },
    selectedText: {
        marginTop: 20,
        fontSize: 16,
        color: "gray",
        textAlign: "center",
    },
});

export default PetrolBunkAdd
