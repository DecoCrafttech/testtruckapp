import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { COLORS } from "../../constants";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import RNPickerSelect from 'react-native-picker-select';
import Constants from 'expo-constants'
import { statesData } from "../../constants/cityAndState";
import { MultiSelect } from "react-native-element-dropdown";
import Checkbox from "expo-checkbox";




const EditModal = ({
  visible,
  onClose,
  onSave,
  loadDetails,
  selectedValue,
  editedDetails,
  setEditedDetails,
  selectedStates,
  setSelectedStates,
  selectedToLocationModalStates,
  selectAllToLocationModalStates,
  handleFilterStates,
  toggleSelectAll,
  filterModalToLocationStatesData,

}) => {


  // google api key
  const googleApiKey = Constants.expoConfig?.extra?.REACT_APP_GOOGLE_PLACES_KEY

  const [locationModal, setLocationModal] = useState(false)

  const [fromLocationModal, setFromLocationModal] = useState(false)
  const [toLocationModal, setToLocationModal] = useState(false)

  useEffect(() => {

    if (loadDetails) {
      setEditedDetails({
        companyName: loadDetails.company_name || "",
        contactNumber: loadDetails.contact_no || "",
        fromLocation: loadDetails.from_location || "",
        toLocation: loadDetails.to_location || "",
        truckBodyType: loadDetails.truck_body_type || "",
        description: loadDetails.description || "",
        material: loadDetails.material || "",
        ton: loadDetails.tone || "",
        numberOfTyres: loadDetails.no_of_tyres || "",
        vehicleNumber: loadDetails.vehicle_number || "",
        ownerName: loadDetails.owner_name || "",
        transportName: loadDetails.name_of_the_transport || "",
        truckBrandName: loadDetails.truck_brand_name || "",
        kmsDriven: loadDetails.kms_driven || "",
        model: loadDetails.model || "",
        price: loadDetails.price || "",
        location: loadDetails.location || "",
        userId: loadDetails.user_id || "",
        userPost: loadDetails.user_post || "",
        updatedTime: loadDetails.updt || "",
        loadId: loadDetails.load_id || "",
        id: loadDetails.id || "",
        driverId: loadDetails.driver_id || "",
        driverName: loadDetails.driver_name || "",
        from: loadDetails.from || "",
        to: loadDetails.to || "",
        profileName: loadDetails.profile_name || "",
        truckId: loadDetails.truck_id || "",
        truckName: loadDetails.truck_name || "",
        truckSize: loadDetails.truck_size || "",
        labels: [
          { icon: "table-view", text: loadDetails.text || "" },
          { icon: "attractions", text: loadDetails.text || "" },
          { icon: "monitor-weight", text: loadDetails.text || "" },
          { icon: "local-shipping", text: loadDetails.text || "" },
          { icon: "verified", text: loadDetails.text || "" },
        ],
      });
    } else {
      setEditedDetails(null);
    }
  }, [loadDetails]);

  const handleSave = () => {
    onSave(editedDetails);
  };

  const handleLabelChange = (text, index) => {
    const updatedLabels = [...editedDetails.labels];
    if (text === "") {
      text = " ";
    }
    updatedLabels[index].text = text;
    setEditedDetails({ ...editedDetails, labels: updatedLabels });
  };



  const renderInputs = () => {
    if (!editedDetails) return null;

    const filteredLabels = editedDetails.labels.filter(label => label.text !== "");



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



      setLocation(`${city}, ${state}`)
      setLocationModal(false)
    };

    const handleFromLocation = (data, details) => {
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



      setEditedDetails({ ...editedDetails, fromLocation: (`${city}, ${state}`) })
      setFromLocationModal(false)
    };

    const handleToLocation = (data, details) => {
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
      setEditedDetails({ ...editedDetails, toLocation: (`${city}, ${state}`) })

      setToLocationModal(false)
    };


    const bodyTypeData = [
      { label: 'Open body', value: 'Open body' },
      { label: 'Container', value: 'Container' },
      { label: 'Trailer', value: 'Trailer' },
      { label: 'Tanker', value: 'Tanker' },
      { label: 'Tipper', value: 'Tipper' },
      { label: 'LCV', value: 'LCV' },
    ];

    const numberOfTyresData = [
      { label: '4', value: '4' },
      { label: '6', value: '6' },
      { label: '10', value: '10' },
      { label: '12', value: '12' },
      { label: '14', value: '14' },
      { label: '16', value: '16' },
      { label: '18', value: '18' },
      { label: '20', value: '20' },
      { label: '22', value: '22' },
    ];


    const brandData = [
      { label: 'Ashok Leyland', value: 'Ashok Leyland' },
      { label: 'Tata', value: 'Tata' },
      { label: 'Mahindra', value: 'Mahindra' },
      { label: 'Eicher', value: 'Eicher' },
      { label: 'Daimler India', value: 'Daimler India' },
      { label: 'Bharat Benz', value: 'Bharat Benz' },
      { label: 'Maruthi Suzuki', value: 'Maruthi Suzuki' },
      { label: 'SML Lsuzu', value: 'SML Lsuzu' },
      { label: 'Force', value: 'Force' },
      { label: 'AMW', value: 'AMW' },
      { label: 'Man', value: 'Man' },
      { label: 'Volvo', value: 'Volvo' },
      { label: 'Scania', value: 'Scania' },
      { label: 'Others', value: 'Others' },
    ]


    const priceData = [
      { label: '0 - 5,00,000 lakhs', value: '(0 - 5,00,000) lakhs' },
      { label: '5,00,001 - 10,00,000 lakhs', value: '(5,00,001 - 10,00,000) lakhs' },
      { label: '10,00,001 - 20,00,000 lakhs', value: '(10,00,001 - 20,00,000) lakhs' },
      { label: '20,00,001 - 30,00,000 lakhs', value: '(20,00,001 - 30,00,000) lakhs' },
      { label: '30,00,001 - 40,00,000 lakhs', value: '(30,00,001 - 40,00,000) lakhs' },
      { label: '40,00,001 - 50,00,000 lakhs', value: '(40,00,001 - 50,00,000) lakhs' },
      { label: '50,00,001 - 60,00,000 lakhs', value: '(50,00,001 - 60,00,000) lakhs' },
      { label: '60,00,001 - 70,00,000 lakhs', value: '(60,00,001 - 70,00,000) lakhs' },
      { label: '70,00,001 - 80,00,000 lakhs', value: '(70,00,001 - 80,00,000) lakhs' },
      { label: '80,00,001 - 90,00,000 lakhs', value: '(80,00,001 - 90,00,000) lakhs' },
      { label: '90,00,001 and above lakhs', value: '(90,00,001 and above) lakhs' }
    ];


    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 40 }, (_, index) => {
      const year = currentYear - index;
      return {
        label: `${year}`,
        value: `${year}`,
      };
    });

    const yearsData = years



    const renderEditModalFields = (selectedValue) => {

      switch (selectedValue) {
        case "user_load_details":
          return (
            <ScrollView style={{ width: "100%", height: "70%" }}>
              <TextInput
                style={styles.input}
                value={editedDetails.companyName}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, companyName: text })
                }
                placeholder="Company name"
              />

              <TextInput
                style={styles.input}
                value={editedDetails.contactNumber}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, contactNumber: text })
                }
                placeholder="Contact Number"
                keyboardType="number-pad"
                maxLength={10}
              />

              <TextInput
                style={styles.input}

                placeholder="From Location"
                value={editedDetails.fromLocation}
                onPress={() => setFromLocationModal(true)}
              />

              <TextInput
                style={styles.input}

                placeholder="To Location"
                value={editedDetails.toLocation}
                onPress={() => setToLocationModal(true)}
              />



              <TextInput
                style={styles.input}
                value={editedDetails.material}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, material: text })
                }
                placeholder="Material"
              />

              <TextInput
                style={styles.input}
                value={editedDetails.ton}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, ton: text })
                }
                placeholder="Ton"
                keyboardType="number-pad"
              />
              
              <TextInput
                style={styles.input}
                value={editedDetails.truckSize}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, truckSize: text })
                }
                placeholder="Truck size"
                keyboardType="number-pad"
              />

              <View style={{ borderColor: COLORS.gray, borderWidth: 1, width: "100%", padding: 0, borderRadius: 5, marginVertical: 8 }}>
                <RNPickerSelect
                  onValueChange={(value) => setEditedDetails({ ...editedDetails, truckBodyType: value })}
                  items={bodyTypeData}
                  value={editedDetails.truckBodyType}
                  placeholder={{
                    label: 'Select truck body type',
                    value: null,
                    color: 'grey',
                  }}
                />
              </View>

              <View style={{ borderColor: COLORS.gray, borderWidth: 1, width: "100%", padding: 0, borderRadius: 5, marginBottom: 8 }}>
                <RNPickerSelect
                  onValueChange={(value) => setEditedDetails({ ...editedDetails, numberOfTyres: value })}
                  items={numberOfTyresData}
                  value={editedDetails.numberOfTyres}
                  placeholder={{
                    label: 'Select number of tyres',
                    value: null,
                    color: 'grey',
                  }}
                />
              </View>

              <TextInput
                style={styles.input}
                value={editedDetails.description}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, description: text })
                }
                placeholder="Description"
              />
            </ScrollView>
          )

        case "user_driver_details":
          return (
            <ScrollView style={{ width: "100%", height: "70%" }}>

              <TextInput
                style={styles.input}
                value={editedDetails.vehicleNumber}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, vehicleNumber: text })
                }
                placeholder="Vehicle number"
              />


              <TextInput
                style={styles.input}
                value={editedDetails.companyName}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, companyName: text })
                }
                placeholder="Owner name"
              />

              <TextInput
                style={styles.input}
                value={editedDetails.contactNumber}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, contactNumber: text })
                }
                placeholder="Contact Number"
                keyboardType="number-pad"
                maxLength={10}
              />

              <TextInput
                style={styles.input}

                placeholder="From Location"
                value={editedDetails.fromLocation}
                onPress={() => setFromLocationModal(true)}
              />


              {/* <MultiSelect
                style={{ borderColor: COLORS.gray, borderWidth: 1, padding: 15, borderRadius: 5 }}
                data={data}
                labelField="label"
                valueField="value"
                placeholder="To Location"
                value={selectedStates}
                onChange={handleSelectedStates}
                placeholderStyle={{ fontSize: 14 }}
              /> */}

              <View style={{ marginTop: 5 }}>

                {/* Show dropdown only if not all states are selected */}
                {!selectAllToLocationModalStates && (
                  <MultiSelect
                    style={{
                      borderColor: "#ccc",
                      borderWidth: 1,
                      padding: 15, // Same as TextInput
                      borderRadius: 5,
                      marginBottom: 10, // Same as TextInput
                      fontSize: 16, // Apply fontSize for consistency
                    }}
                    data={filterModalToLocationStatesData} // Use actual states data
                    labelField="label" // Ensure correct field names
                    valueField="value"
                    placeholder={selectedToLocationModalStates.length ? `${selectedToLocationModalStates.length} states selected` : "To Location"}
                    value={selectedToLocationModalStates}
                    onChange={handleFilterStates}
                    placeholderStyle={{ fontSize: 14 }}
                  />
                )}

                {
                  selectAllToLocationModalStates &&
                  <TextInput
                    style={{
                      borderColor: "#ccc",
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      marginBottom: 10,
                      fontSize: 16
                    }}
                    value="To Location (All states selected)"
                    editable={false}
                  />
                }

                {/* Select All Checkbox */}
                <View >
                  <TouchableOpacity onPress={toggleSelectAll} style={{ flexDirection: "row", alignItems: "center", marginVertical: 8 }}>
                    <Checkbox value={selectAllToLocationModalStates} onValueChange={toggleSelectAll} />
                    <Text style={{ marginLeft: 8 }}>Select All States</Text>
                  </TouchableOpacity>
                </View>

              </View>


              {/* <TextInput
                style={styles.input}
                value={editedDetails.transportName}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, transportName: text })
                }
                placeholder="Transport name"
              /> */}



              <View style={{ borderColor: COLORS.gray, borderWidth: 1, width: "100%", padding: 0, borderRadius: 5, marginVertical: 8 }}>
                <RNPickerSelect
                  onValueChange={(value) => setEditedDetails({ ...editedDetails, truckBodyType: value })}
                  items={bodyTypeData}
                  value={editedDetails.truckBodyType}
                  placeholder={{
                    label: 'Select truck body type',
                    value: null,
                    color: 'grey',
                  }}
                />
              </View>

              <View style={{ borderColor: COLORS.gray, borderWidth: 1, width: "100%", padding: 0, borderRadius: 5, marginBottom: 8 }}>
                <RNPickerSelect
                  onValueChange={(value) => setEditedDetails({ ...editedDetails, numberOfTyres: value })}
                  items={numberOfTyresData}
                  value={editedDetails.numberOfTyres}
                  placeholder={{
                    label: 'Select number of tyres',
                    value: null,
                    color: 'grey',
                  }}
                />
              </View>

              <TextInput
                style={styles.input}
                value={editedDetails.description}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, description: text })
                }
                placeholder="Description"
              />
            </ScrollView>
          )

        case "user_truck_details":
          return (
            <ScrollView style={{ width: "100%", height: "70%" }}>

              <TextInput
                style={styles.input}
                value={editedDetails.vehicleNumber}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, vehicleNumber: text })
                }
                placeholder="Vehicle number"
              />


              <TextInput
                style={styles.input}
                value={editedDetails.companyName}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, companyName: text })
                }
                placeholder="Owner name"
              />

              <TextInput
                style={styles.input}
                value={editedDetails.contactNumber}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, contactNumber: text })
                }
                placeholder="Contact Number"
                keyboardType="number-pad"
                maxLength={10}
              />

              <TextInput
                style={styles.input}
                value={editedDetails.transportName}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, transportName: text })
                }
                placeholder="Name of the transport"
              />

              <TextInput
                style={styles.input}
                value={editedDetails.ton}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, ton: text })
                }
                placeholder="Ton"
                keyboardType="number-pad"

              />


              <View style={{ borderColor: COLORS.gray, borderWidth: 1, width: "100%", padding: 0, borderRadius: 5, marginVertical: 8 }}>
                <RNPickerSelect
                  onValueChange={(value) => setEditedDetails({ ...editedDetails, truckName: value })}
                  items={brandData}
                  value={editedDetails.truckName}
                  placeholder={{
                    label: 'Select truck brand name',
                    value: null,
                    color: 'grey',
                  }}
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="From Location"
                value={editedDetails.fromLocation}
                onPress={() => setFromLocationModal(true)}
              />

              <View style={{ marginBottom: 10 }}>
                {/* Show dropdown only if not all states are selected */}
                {!selectAllToLocationModalStates && (
                  <MultiSelect
                    style={{
                      borderColor: "#ccc",
                      borderWidth: 1,
                      padding: 15, // Same as TextInput
                      borderRadius: 5,
                      marginBottom: 10, // Same as TextInput
                      fontSize: 16, // Apply fontSize for consistency
                    }}
                    data={filterModalToLocationStatesData} // Use actual states data
                    labelField="label" // Ensure correct field names
                    valueField="value"
                    placeholder={selectedToLocationModalStates.length ? `${selectedToLocationModalStates.length} states selected` : "To Location"}
                    value={selectedToLocationModalStates}
                    onChange={handleFilterStates}
                    placeholderStyle={{ fontSize: 14 }}
                  />
                )}

                {
                  selectAllToLocationModalStates &&
                  <TextInput
                    style={{
                      borderColor: "#ccc",
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      marginBottom: 10,
                      fontSize: 16
                    }}
                    value="To Location (All states selected)"
                    editable={false}
                  />
                }

                {/* Select All Checkbox */}
                <View >
                  <TouchableOpacity onPress={toggleSelectAll} style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                    <Checkbox value={selectAllToLocationModalStates} onValueChange={toggleSelectAll} />
                    <Text style={{ marginLeft: 8 }}>Select All States</Text>
                  </TouchableOpacity>
                </View>

              </View>


              <TextInput
                style={styles.input}
                placeholder="Truck size"
                value={editedDetails.truckSize}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, truckSize: text })
                }
              />



              <View style={{ borderColor: COLORS.gray, borderWidth: 1, width: "100%", padding: 0, borderRadius: 5, marginVertical: 8 }}>
                <RNPickerSelect
                  onValueChange={(value) => setEditedDetails({ ...editedDetails, truckBodyType: value })}
                  items={bodyTypeData}
                  value={editedDetails.truckBodyType}
                  placeholder={{
                    label: 'Select truck body type',
                    value: null,
                    color: 'grey',
                  }}
                />
              </View>

              <View style={{ borderColor: COLORS.gray, borderWidth: 1, width: "100%", padding: 0, borderRadius: 5, marginBottom: 8 }}>
                <RNPickerSelect
                  onValueChange={(value) => setEditedDetails({ ...editedDetails, numberOfTyres: value })}
                  items={numberOfTyresData}
                  value={editedDetails.numberOfTyres}
                  placeholder={{
                    label: 'Select number of tyres',
                    value: null,
                    color: 'grey',
                  }}
                />
              </View>

              <TextInput
                style={styles.input}
                value={editedDetails.description}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, description: text })
                }
                placeholder="Description"
              />
            </ScrollView>
          )

        case "user_buy_sell_details":
          return (
            <ScrollView style={{ width: "100%", height: "70%" }}>
              <TextInput
                style={styles.input}
                value={editedDetails.ownerName}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, ownerName: text })
                }
                placeholder="Owner name"
              />

              <TextInput
                style={styles.input}
                value={editedDetails.contactNumber}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, contactNumber: text })
                }
                placeholder="Contact Number"
                keyboardType="number-pad"
                maxLength={10}
              />

              <TextInput
                style={styles.input}
                value={editedDetails.vehicleNumber}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, vehicleNumber: text })
                }
                placeholder="Vehicle number"
              />

              <TextInput
                style={styles.input}
                value={editedDetails.kmsDriven}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, kmsDriven: text })
                }
                placeholder="Kms driven"
              />



              <View style={{ borderColor: COLORS.gray, borderWidth: 1, width: "100%", padding: 0, borderRadius: 5, marginVertical: 8 }}>
                <RNPickerSelect
                  onValueChange={(value) => setEditedDetails({ ...editedDetails, brand: value })}
                  items={brandData}
                  value={editedDetails.brand}
                  placeholder={{
                    label: 'Brand',
                    value: null,
                    color: 'grey',
                  }}
                />
              </View>

              <View style={{ borderColor: COLORS.gray, borderWidth: 1, width: "100%", padding: 0, borderRadius: 5, marginVertical: 8 }}>
                <RNPickerSelect
                  onValueChange={(value) => setEditedDetails({ ...editedDetails, model: value })}
                  items={yearsData}
                  value={editedDetails.model}
                  placeholder={{
                    label: 'Model',
                    value: null,
                    color: 'grey',
                  }}
                />
              </View>

              <View style={{ borderColor: COLORS.gray, borderWidth: 1, width: "100%", padding: 0, borderRadius: 5, marginVertical: 8 }}>
                <RNPickerSelect
                  onValueChange={(value) => setEditedDetails({ ...editedDetails, price: value })}
                  items={priceData}
                  value={editedDetails.price}
                  placeholder={{
                    label: 'Price',
                    value: null,
                    color: 'grey',
                  }}
                />
              </View>


              <TextInput
                style={styles.input}
                placeholder="Location"
                value={editedDetails.location}
                onPress={() => setLocationModal(true)}
              />



              <TextInput
                style={styles.input}
                value={editedDetails.description}
                onChangeText={(text) =>
                  setEditedDetails({ ...editedDetails, description: text })
                }
                placeholder="Description"
              />
            </ScrollView>
          )


        default:
          break;

      }



    }

    return (
      <>
        {renderEditModalFields(selectedValue)}

        {filteredLabels.map((data, index) => (

          <TextInput
            key={index}
            style={styles.input}
            value={data.text}
            onChangeText={(text) => handleLabelChange(text, index)}
            placeholder={`Label ${index + 1}`}
          />
        ))}


        {/* Location Modal */}
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
                />
              </View>


              <TouchableOpacity style={styles.closeButton} onPress={() => setLocationModal(false)}>
                <Text style={styles.applyButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>



        {/*From Location Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={fromLocationModal}
        >
          <View style={styles.locationModalContainer}>
            <View style={styles.locationModalContent}>


              <View style={styles.locationContainer}>
                <GooglePlacesAutocomplete
                  placeholder="Search location"
                  onPress={handleFromLocation}
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
                />
              </View>


              <TouchableOpacity style={styles.closeButton} onPress={() => setFromLocationModal(false)}>
                <Text style={styles.applyButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*To Location Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={toLocationModal}
        >
          <View style={styles.locationModalContainer}>
            <View style={styles.locationModalContent}>


              <View style={styles.locationContainer}>
                <GooglePlacesAutocomplete
                  placeholder="Search location"
                  onPress={handleToLocation}
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
                />
              </View>


              <TouchableOpacity style={styles.closeButton} onPress={() => setToLocationModal(false)}>
                <Text style={styles.applyButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </>
    );
  };






  return (

    <>

      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.header}>Edit</Text>
            {renderInputs()}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={!visible}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>







    </>


  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    textAlign: "left",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",

  },
  modalContent: {
    backgroundColor: COLORS.white,
    width: "80%",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: "100%",
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
  locationModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    height: "90%"
  },
  locationModalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    width: "80%",
    borderRadius: 10,
    elevation: 5,
    height: "80%"
  },
  locationContainer: {
    flex: 1,
    padding: 5,
  },
  locationTextInput: {
    borderWidth: 1,
    borderColor: COLORS.gray,
  },

  multiSelectBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
  },
  multiSelectBox: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'grey',
    padding: 10,
    paddingLeft: 15,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12

  },
  selectToggleText: {
    color: '#000',
    fontSize: 14
  },
  selectText: {
    color: 'red'
  },
  selectedItemText: {
    color: COLORS.primary,
  },
  multiSelectChipContainer: {
    borderWidth: 0,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  multiSelectChipText: {
    color: '#222',
    fontSize: 12,
  },
});

export default EditModal;