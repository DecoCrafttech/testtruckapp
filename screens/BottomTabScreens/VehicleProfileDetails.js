import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Button, ActivityIndicator } from "react-native";
import { COLORS, images } from "../../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoadNeedsContext } from "../../hooks/LoadNeedsContext";
import Container, { Toast } from 'toastify-react-native';
import axiosInstance from "../../services/axiosInstance";
import { Alert } from "react-native";
import Constants from 'expo-constants'


const VehicleProfileDetails = () => {


  // cdn link
  const cdnLink = Constants.expoConfig?.extra?.REACT_APP_CDN_LINK

  const {
    isLoading,
    setIsLoading,
  } = useContext(LoadNeedsContext)

  const [modalVisible, setModalVisible] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [isInputValid, setIsInputValid] = useState(true);
  const [pageLoading, setPageLoading] = useState(false)
  const [pageRefresh, setPageRefresh] = useState(false)
  const [submitClicked, setSubmitClicked] = useState(false)
  const [users, setUsers] = useState([])
  const currentDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const getProfilePage = async () => {
      const getVehicleDetailsParams = {
        user_id: await AsyncStorage.getItem("user_id")
      }
      const response = await axiosInstance.post("/get_user_profile", getVehicleDetailsParams)

      if (response.data.error_code === 0) {

        setUsers(response.data.data[0].vehicle_data)
        setTimeout(() => {
          setPageLoading(true)
        }, 1000);
      } else {
        console.log(response.data.message)
      }
    }
    (async () => getProfilePage())()
  }, [isLoading, pageRefresh, pageLoading])






  const handleAddTruck = () => {
    setModalVisible(true);
  };

  const handleSubmit = async () => {


    if (vehicleNumber === "") {
      setIsInputValid(false);
    } else {

      const addTruckParams = {
        user_id: await AsyncStorage.getItem("user_id"),
        vehicle_no: `${vehicleNumber}`
      }
      try {
        setSubmitClicked(true)
        setPageLoading(true)

        const response = await axiosInstance.post("/add_user_vehicle_details", addTruckParams)

        if (response.data.error_code === 0) {
          Toast.success("Posted successfully")


          // Reset state and close modal99
          setModalVisible(false);
          setVehicleNumber("");
          setIsInputValid(true);
          setPageLoading(false)
          setSubmitClicked(false)

          setIsLoading(!isLoading)

        } else {
          console.log(response.data.message)
          setSubmitClicked(false)

        }

      } catch (err) {
        console.log(err)
        setSubmitClicked(false)

      }
    }





  };



  const handleDeleteProfile = async (vehicleNo) => {

    Alert.alert("Delete post", "Are you sure want to delete this vehicle?",
      [
        {
          text: "Yes",
          onPress: async () => {
            const removeVehicleParams = {
              user_id: await AsyncStorage.getItem("user_id"),
              vehicle_no: vehicleNo
            }
            try {
              const response = await axiosInstance.post("/remove_user_vehicle_details", removeVehicleParams)
              if (response.data.error_code === 0) {
                alert(response.data.message)
                setPageRefresh(!pageRefresh)

              } else {
                console.log(response.data.message)
              }

            } catch (err) {
              console.log(err)
            }
          }
        },
        {
          text: "Cancel",
          onPress: () => null
        }
      ]
    )

  };




  return (
    <>
      <Container
        position="top"
        duration={3000}
        animationIn="slideInDown"
        height="auto"
        width="100%"
        textStyle={{
          fontSize: 15,
          flexWrap: 'wrap', // Ensure text wraps
          maxWidth: '90%', // Ensure text does not overflow
          overflow: 'hidden',
        }} // Ensure text wraps
      />
      {
        pageLoading === false ?
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size='large' color={COLORS.primary} />
          </View>
          :
          <ScrollView contentContainerStyle={[styles.scrollContainer]}>
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.headerText}>Truck Details</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddTruck}>
                  <Text style={styles.buttonText}>Add Truck</Text>
                </TouchableOpacity>
              </View>
              {
                users.length === 0 ?
                  <View style={styles.noResultContainer}>
                    <View>
                      <Image
                        source={{ uri: `${cdnLink}/Folder_empty.png` }}
                        width={50}
                        height={50}
                        resizeMode="center"
                      />
                    </View>
                    <Text style={styles.noResultsText}>No records</Text>
                  </View>
                  :
                  <>
                    {users.reverse().map((user, index) => (
                      <View key={index} style={styles.userCard}>
                        <View style={[styles.userInfo]}>
                          <Text style={styles.vehicleNumber}>{user.vehicle_no}</Text>
                          <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: "100%" }}>
                            <View>
                              <Text style="">Fitness UpTo</Text>
                              <Text style={styles.userFollowers}>{user.fit_up_to}</Text>
                            </View>
                            {
                              user.fit_up_to !== null && user.fit_up_to !== 'none' && user.fit_up_to !== undefined && user.fit_up_to > currentDate ?
                                <View style={styles.greenCircle}>
                                  <Text style={styles.userFollowers}></Text>
                                </View>
                                :
                                <View style={styles.redCircle}>
                                  <Text style={styles.userFollowers}></Text>
                                </View>
                            }
                          </View>
                          <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: "100%" }}>
                            <View>
                              <Text style="">Insurance</Text>
                              <Text style={styles.userFollowers}>{user.insurance_company ? user.insurance_company : "none"}</Text>
                            </View>
                            {
                              user.insurance_company !== null && user.insurance_company !== 'none' && user.insurance_company !== undefined && user.insurance_company !== "NA" && user.insurance_company > currentDate ?
                                <View style={styles.greenCircle}>
                                  <Text style={styles.userFollowers}></Text>
                                </View>
                                :
                                <View style={styles.redCircle}>
                                  <Text style={styles.userFollowers}></Text>
                                </View>
                            }
                          </View>
                          <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: "100%" }}>
                            <View>
                              <Text style="">Pollution Certificate</Text>
                              <Text style={styles.userFollowers}>{user.pucc_upto ? user.pucc_upto : "none"}</Text>
                            </View>
                            {
                              user.pucc_upto !== null && user.pucc_upto !== 'none' && user.pucc_upto !== undefined && user.pucc_upto > currentDate ?
                                <View style={styles.greenCircle}>
                                  <Text style={styles.userFollowers}></Text>
                                </View>
                                :
                                <View style={styles.redCircle}>
                                  <Text style={styles.userFollowers}></Text>
                                </View>
                            }
                          </View>
                          <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: "100%" }}>
                            <View>
                              <Text style="">Road Tax</Text>
                              <Text style={styles.userFollowers}>{user.tax_paid_upto ? user.tax_paid_upto : "none"}</Text>
                            </View>
                            {
                              user.tax_paid_upto !== null && user.tax_paid_upto !== 'none' && user.tax_paid_upto !== undefined && user.tax_paid_upto > currentDate ?
                                <View style={styles.greenCircle}>
                                  <Text style={styles.userFollowers}></Text>
                                </View>
                                :
                                <View style={styles.redCircle}>
                                  <Text style={styles.userFollowers}></Text>
                                </View>
                            }
                          </View>
                          <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: "100%" }}>
                            <View>
                              <Text style="">RC Status</Text>
                              <Text style={styles.userFollowers}>{user.rc_status ? user.rc_status : "none"}</Text>
                            </View>
                            {
                              user.rc_status !== null && user.rc_status !== 'none' && user.rc_status !== undefined && user.rc_status > currentDate ?
                                <View style={styles.greenCircle}>
                                  <Text style={styles.userFollowers}></Text>
                                </View>
                                :
                                <View style={styles.redCircle}>
                                  <Text style={styles.userFollowers}></Text>
                                </View>
                            }
                          </View>

                        </View>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleDeleteProfile(user.vehicle_no)}
                        >
                          <Image
                            source={images.deleteIcon}
                            style={styles.icon}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </>
              }

              {/* Modal for adding truck */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                  setModalVisible(false);
                  setIsInputValid(true); // Reset input validation state
                }}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add Truck</Text>
                    <TextInput
                      style={[styles.input, !isInputValid && styles.inputError]} // Conditional styling based on validation
                      placeholder="Enter Vehicle Number. eg : TN00AB1234"
                      maxLength={10}
                      value={vehicleNumber}
                      onChangeText={(text) => {
                        setVehicleNumber(text);
                        setIsInputValid(true); // Reset validation when typing
                      }}
                    />
                    {!isInputValid && (
                      <Text style={styles.errorText}>Please enter valid vehicle number</Text>
                    )}
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', gap: 20, marginTop: 20 }}>

                      {
                        submitClicked === true ?
                          <TouchableOpacity style={[styles.submitButton, { opacity: 0.5 }]} disabled>
                            <ActivityIndicator size="small" color="#fff" />
                          </TouchableOpacity>
                          :
                          <TouchableOpacity style={styles.submitButton} onPress={handleAddTruck}>
                            <Text style={styles.buttonText} onPress={handleSubmit}>Submit</Text>
                          </TouchableOpacity>
                      }
                      <TouchableOpacity style={styles.cancelButton} onPress={handleAddTruck}>
                        <Text style={styles.buttonText} onPress={() => {
                          setIsInputValid(true);
                          setModalVisible(false)
                        }} >Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          </ScrollView>
      }
    </>


  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F1F2FF'
  },
  editButton: {
    // marginHorizontal: 5,
    alignSelf: 'flex-start'
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#F1F2FF'
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.secondaryGray,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F6F8FF",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    shadowColor: '#303030',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    Color: '#F6F8FF',
    borderColor: '#fff',
    borderWidth: 2,
  },
  userPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,

  },
  vehicleNumber: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  userFollowers: {
    color: "#999",
  },
  icon: {
    width: 30,
    height: 30,
  },
  // Modal styles
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
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  noResultContainer: {
    marginTop: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    textAlign: "center",
    marginTop: -90,
    marginBottom: 30,
    color: "grey",
    fontSize: 16,
  },
  redCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'red'
  },
  greenCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'green'
  }
});

export default VehicleProfileDetails;
