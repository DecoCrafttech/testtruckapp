import React, { useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, View, Button, Alert, Text, ScrollView, TextInput, Modal, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import HeaderWithOutBS from "../../components/HeaderWithOutBS";
import RBSheet from 'react-native-raw-bottom-sheet'
import { COLORS } from "../../constants";
import AntDesign from '@expo/vector-icons/AntDesign';



const GOOGLE_API_KEY = "AIzaSyCLT-nqnS-13nBpe-mqzJVsRK7RZIl3I5s";

const Petrolbunks = () => {

  const refRBSheet = useRef()


  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);

  const [fromLocationPlace, setFromLocationPlace] = useState("");
  const [toLocationPlace, setToLocationPlace] = useState("");
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [petrolBunks, setPetrolBunks] = useState([]);
  const [petrolBunksCopy, setPetrolBunksCopy] = useState([]);
  const [allPetrolBunks, setAllPetrolBunks] = useState([]); // State to store all petrol bunks
  const [nearbyBunks, setNearByBunks] = useState([])
  const [filteredBunks, setFilteredBunks] = useState([])
  const mapRef = useRef(null);
  const navigate = useNavigation()
  const [showViewBunks, setShowViewBunks] = useState(false)


  const [fromLocationModal, setFromLocationModal] = useState(false)
  const [toLocationModal, setToLocationModal] = useState(false)
  const [filterBunksModal, setFilterBunksModal] = useState(false)


  const [discount, setDiscount] = useState("");

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


  useFocusEffect(
    useCallback(() => {
      fetchPetrolBunks();
    }, [])
  )



  const fetchPetrolBunks = async () => {
    try {
      const response = await fetch(
        "https://truck.truckmessage.com/get_petrol_bunk_details",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setAllPetrolBunks(data.data); // Save petrol bunk details
      } else {
        Alert.alert("Error", "Failed to fetch petrol bunk details.");
      }
    } catch (error) {
      console.error("Error fetching petrol bunks:", error.message);
      Alert.alert("Error", "Unable to fetch petrol bunk details.");
    }
  };


  const findNearbyPetrolBunks = (routeCoordinates) => {
    if (!allPetrolBunks.length) return;

    const nearbyBunks = allPetrolBunks.filter((bunk) =>
      routeCoordinates.some((point) => {
        const distance = getDistanceFromLatLonInKm(
          point.latitude,
          point.longitude,
          parseFloat(bunk.latitude),
          parseFloat(bunk.longitude)
        );
        return distance <= 5;
      })
    );

    setPetrolBunks(nearbyBunks);
    setPetrolBunksCopy(nearbyBunks)
    setNearByBunks(nearbyBunks)
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  const fetchRoute = async () => {
    if (!fromLocation || !toLocation) {
      Alert.alert("Error", "Please select both From and To locations.");
      return;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${fromLocation.lat},${fromLocation.lng}&destination=${toLocation.lat},${toLocation.lng}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.routes.length > 0) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
        if (mapRef.current) {
          mapRef.current.fitToCoordinates(points, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
        findNearbyPetrolBunks(points);
        setShowViewBunks(true)

      } else {
        Alert.alert("Error", "No route found.");
      }
    } catch (error) {
      console.error("Error fetching route:", error.message);
      Alert.alert("Error", "Unable to fetch route.");
    }
  };


  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  const handleAddPetrolBunk = () => {
    navigate.navigate("PetrolBunkAdd")
  }

  const handleFromLocation = (data, details) => {
    const location = details.geometry.location;
    setFromLocation({ lat: location.lat, lng: location.lng });
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

    setFromLocationPlace(`${city}, ${state}`)
    setFromLocationModal(false)
  }

  const handleToLocation = (data, details) => {
    const location = details.geometry.location;
    setToLocation({ lat: location.lat, lng: location.lng });

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
    setToLocationPlace(`${city}, ${state}`)
    setToLocationModal(false)
  }


  // Toggle the state of a specific amenity
  const toggleCheckbox = (key) => {
    setAmenities((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };


  const handleFilterBunksModal = () => {
    setFilterBunksModal(true)
  }


  const handleFilterBunks = () => {
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
    const filteredBunks = petrolBunksCopy.filter(bunk =>
      activeAmenities.every(amenity => bunk.amenities.map(a => a.toLowerCase()).includes(amenity.toLowerCase()))
    );

    setPetrolBunks(filteredBunks);
    setFilterBunksModal(false)

  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithOutBS title="Petrol Bunk" isPetrolBunkPage="true" onPress={handleAddPetrolBunk} />

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={MapView.PROVIDER_GOOGLE}
          ref={mapRef}
          initialRegion={{
            latitude: 20.5937,
            longitude: 78.9629,
            latitudeDelta: 10,
            longitudeDelta: 10,
          }}
        >
          {fromLocation && (
            <Marker
              coordinate={{
                latitude: fromLocation.lat,
                longitude: fromLocation.lng,
              }}
              title="From"
            />
          )}
          {toLocation && (
            <Marker
              coordinate={{
                latitude: toLocation.lat,
                longitude: toLocation.lng,
              }}
              title="To"
            />
          )}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#ff0000"
              strokeWidth={4}
            />
          )}
          {petrolBunks.map((bunk) => (
            <Marker
              key={bunk.bunk_id}
              coordinate={{
                latitude: parseFloat(bunk.latitude),
                longitude: parseFloat(bunk.longitude),
              }}
              title={bunk.petrol_bunk_name}
              description={`Owner: ${bunk.owner_name}`}
            />
          ))}
        </MapView>
      </View>
      <View style={styles.inputContainer}>

        <TextInput
          style={[
            styles.textInput,
          ]}
          placeholder="From Location"
          value={fromLocationPlace}
          onPress={() => setFromLocationModal(true)}
        />

        <TextInput
          style={[
            styles.textInput,
          ]}
          placeholder="To location"
          value={toLocationPlace}
          onPress={() => setToLocationModal(true)}
        />

        <View style={{ marginBottom: 20 }}>
          <Button title="Submit" color="green" onPress={fetchRoute} />
        </View>
        {
          showViewBunks &&
          <View style={{ marginBottom: 20 }}>
            <Button title="View bunks" onPress={() => refRBSheet.current.open()} />
          </View>
        }
      </View>


      {
        <View>
          <RBSheet
            ref={refRBSheet}
            height={500}
            openDuration={250}
            closeOnDragDown={true}
            closeOnPressBack={true}
            // closeOnPressMask={false}
            customStyles={{
              wrapper: {
                backgroundColor: "rgba(0,0,0,0.5)",
              },
              draggableIcon: {
                backgroundColor: COLORS.gray,
                width: 100,
              },
              container: {
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              },
            }}
          >
            <View>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: 10 }}>
                <Text onPress={() => handleFilterBunksModal()} style={{ color: COLORS.white, fontWeight: '700', backgroundColor: COLORS.primary, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 5, textAlign: 'right', width: '', marginBottom: 10 }}>Filter bunks</Text>
              </View>
              <ScrollView style={styles.tableContainer}>


                <View style={styles.tableHeader}>
                  <Text style={styles.tableCell}>Name</Text>
                  <Text style={styles.tableCell}>Location</Text>
                  <Text style={styles.tableCell}>Amenities</Text>
                </View>
                {petrolBunks.map((bunk) => (
                  <View style={styles.tableRow} key={bunk.bunk_id}>
                    <Text style={styles.tableCell}>{bunk.petrol_bunk_name}</Text>
                    <Text style={styles.tableCell}>{bunk.location}</Text>
                    <Text style={styles.tableCell}>{bunk.amenities.join(", ")}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </RBSheet>
        </View>
      }


      {/* From Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={fromLocationModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>From Location</Text>
            <View style={styles.locationContainer}>
              <GooglePlacesAutocomplete
                placeholder="From"
                textInputProps={{
                  autoFocus: true,
                }}
                onPress={(data, details = null) => handleFromLocation(data, details)}
                fetchDetails
                query={{
                  key: GOOGLE_API_KEY,
                  language: "en",
                  components: "country:in",
                }}
                styles={styles.autoCompleteStyles}
              />
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => setFromLocationModal(false)}>
              <Text style={styles.applyButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* To Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={toLocationModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>To Location</Text>


            <View style={styles.locationContainer}>
              <GooglePlacesAutocomplete
                placeholder="To"
                textInputProps={{
                  autoFocus: true,
                }}
                onPress={(data, details = null) => handleToLocation(data, details)}
                fetchDetails
                query={{
                  key: GOOGLE_API_KEY,
                  language: "en",
                  components: "country:in",
                }}
                styles={styles.autoCompleteStyles}

              />
            </View>


            <TouchableOpacity style={styles.closeButton} onPress={() => setToLocationModal(false)}>
              <Text style={styles.applyButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* Filter bunks Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterBunksModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <Text style={[styles.modalTitle, { marginBottom: 0, marginLeft: "auto", marginRight: 'auto' }]}>Filter bunks</Text>
              <AntDesign name="close" size={25} color="black" onPress={() => setFilterBunksModal(false)} />
            </View>

            <ScrollView style={styles.locationContainer}>


              <Text style={[styles.label, { marginBottom: 20, fontWeight: 600 }]}>Amenities :</Text>

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

              <Text style={[styles.label, { marginTop: 10 }]}>Discount</Text>
              <TextInput
                style={[
                  styles.textInput,
                ]}
                placeholder="Enter discount"
                onChangeText={setDiscount}
                value={discount}
              />

            </ScrollView>

            <TouchableOpacity style={styles.closeButton} onPress={handleFilterBunks}>
              <Text style={styles.applyButtonText}>Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  inputContainer: { marginTop: 30, width: "100%", zIndex: 2, paddingHorizontal: 10, marginBottom: 20, },
  mapContainer: { zIndex: 0, marginTop: 10, height: 400 },
  map: { ...StyleSheet.absoluteFillObject, },
  autoCompleteStyles: {
    container: { flex: 0, marginBottom: 10 },
    textInput: { height: 40, borderColor: "#ccc", borderWidth: 1, paddingHorizontal: 8, backgroundColor: "white" },
    listView: { backgroundColor: "white" },
  },
  tableContainer: { flex: 1, paddingHorizontal: 10, width: 350 },
  tableHeader: { flexDirection: "row", backgroundColor: "#ccc", padding: 10, },
  tableRow: { flexDirection: "row", },
  tableCell: { flex: 1, padding: 5, borderWidth: 1, borderColor: "#ccc" },


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
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
});

export default Petrolbunks;