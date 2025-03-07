import { ActivityIndicator, Alert, BackHandler, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES } from '../../constants'
import Header from '../../components/Header'
import BottomSheet from '../../components/BottomSheet'
import ServiceCategory from '../ServiceCategory'
import { useFocusEffect } from '@react-navigation/native'
import RBSheet from 'react-native-raw-bottom-sheet'
import MultiSelectComponent from '../../components/MultiSelectComponent'
import { statesData } from '../../constants/cityAndState'
import { TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axiosInstance from '../../services/axiosInstance'
import { LoadNeedsContext } from '../../hooks/LoadNeedsContext'
import AntDesign from '@expo/vector-icons/AntDesign';
import { MaterialCommunityIcons } from '@expo/vector-icons'


const Home = () => {
  const refRBSheet = useRef()
  const refRBSheetStates = useRef()

  const {
    isFirstSignup,
    setIsFirstSignup,
    userStatesFromProfile,
    setUserStatesFromProfile
  } = useContext(LoadNeedsContext)

  const [selectedStates, setSelectedStates] = useState([]);
  const [operatingStates, setOperatingStates] = useState([])
  const [pageLoading, setPageLoading] = useState(false)
  const [notifications, setNotifications] = useState([])


  useFocusEffect(
    React.useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress)

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress)
      }
    })
  )

  useEffect(() => {
    setPageLoading(true)
    setTimeout(() => {
      setPageLoading(false)
      const bottomSheetOpen = () => {
        isFirstSignup === true ? refRBSheetStates.current.open() : null
      }

      bottomSheetOpen()
    }, 2000);
  }, [])


  useEffect(() => {
    const getNotifications = async () => {
      const userPostParameters = {
        user_id: await AsyncStorage.getItem("user_id"),
      };

      try {
        const response = await axiosInstance.post(`/get_web_notification`, userPostParameters);
        if (response.data.error_code === 0) {
          setNotifications(response.data.data)
        } else {
          console.log(response.data.message);
        }
      } catch (error) {
        console.log(error);
      }
    }

    getNotifications()
  }, [])


  useEffect(() => {

    setStateFun()
  }, [])

  const setStateFun = () => {
    setUserStatesFromProfile(userStatesFromProfile)
  }

  const handleBackPress = () => {
    Alert.alert('Exit App', 'Are you sure want to exit?',
      [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel'
        },
        {
          text: 'Exit',
          onPress: () => BackHandler.exitApp()
        }
      ]
    )
    return true
  }


  const handleStatesSubmit = async () => {
    try {

      const addStatesParams = {
        "user_id": `${await AsyncStorage.getItem("user_id")}`,
        "state_name": operatingStates
      }

      const res = await axiosInstance.post("/user_state_entry", addStatesParams)

      if (res.data.error_code === 0) {
        refRBSheetStates.current.close()
        setOperatingStates([])
        setSelectedStates([])
        setUserStatesFromProfile(...userStatesFromProfile, operatingStates)
      } else {
        console.log(res.data.message)
      }
    } catch (err) {
      console.log(err)
    }
  }


  const handleClearNotifications = async () => {
    try {
      const payload = {
        "user_id": `${await AsyncStorage.getItem("user_id")}`,
      }

      const res = await axiosInstance.post("/clear_web_notification", payload)
      if (res.data.error_code === 0) {
        setNotifications([])
        // setNotifications(res.data.data)
      } else {
        console.log(res.data.message)
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      {
        pageLoading === true ?
          <View style={styles.container}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
          :
          <View style={styles.container2}>
            <View style={{ flex: 1, backgroundColor: COLORS.white }}>
              <Header
                title="Truck Message"
                onPress={() => refRBSheet.current.open()}
                hasNotifications={notifications.length === 0 ? false : true}
              />
              <ServiceCategory />
            </View>
            <BottomSheet bottomSheetRef={refRBSheetStates} />

            {
              <View>
                <RBSheet
                  ref={refRBSheet}
                  height={500}
                  openDuration={250}
                  closeOnDragDown={true}
                  closeOnPressBack={true}
                  closeOnPressMask={true}
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
                    <ScrollView>
                      <Text
                        style={{ marginBottom: 20, textAlign: 'right', fontSize: 18, fontWeight: "700", marginBottom: 18, color: COLORS.primary }}
                        onPress={() => {
                          setIsFirstSignup(false)
                          refRBSheet.current.close()
                        }}
                      >
                        <AntDesign name="close" size={24} color="black" />
                      </Text>
                      <View style={{ marginBottom: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: "100%" }}>
                        <Text style={{ fontSize: 20, fontWeight: "700", color: COLORS.primary }}>Notifications</Text>
                        <TouchableOpacity style={styles.buttonContainer} onPress={() => handleClearNotifications()}>
                          <Text style={styles.buttonText}>Clear</Text>
                        </TouchableOpacity>
                      </View>

                      {
                        notifications.length !== 0 ?
                          notifications.map((item, index) => {
                            return (
                              <React.Fragment key={index}>
                                <TouchableOpacity
                                  style={[
                                    styles.userContainer,

                                  ]}
                                >
                                  <View style={styles.userImageContainer}>
                                  <MaterialCommunityIcons name="message-text" size={30} color="black" />
                                  </View>
                                  <View style={{
                                    flexDirection: 'row',
                                    width: SIZES.width - 104,
                                  }}>
                                    <View style={styles.userInfoContainer}>
                                      <Text style={styles.fullName}>{item.title}</Text>
                                      <Text style={styles.lastMessage}>{item.message}</Text>
                                    </View>
                                  </View>
                                </TouchableOpacity>
                              </React.Fragment>
                            )
                          })
                          :
                          <View style={{ justifyContent: 'center', alignItems: 'center', height: 300 }}>
                            <Text>
                              You have no notifications
                            </Text>
                          </View>
                      }


                    </ScrollView>
                  </View>
                </RBSheet>
              </View>
            }

            {
              <View>
                <RBSheet
                  ref={refRBSheetStates}
                  height={500}
                  openDuration={250}
                  closeOnDragDown={true}
                  closeOnPressBack={true}
                  closeOnPressMask={false}
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
                    <ScrollView>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 18, color: COLORS.primary }}>Add your Operating States</Text>
                        <Text
                          style={{ fontSize: 18, fontWeight: "700", marginBottom: 18, color: COLORS.primary }}
                          onPress={() => {
                            setIsFirstSignup(false)
                            refRBSheetStates.current.close()
                          }}
                        >
                          <AntDesign name="close" size={24} color="black" />
                        </Text>
                      </View>
                      <View style={{ width: 320 }}>
                        <MultiSelectComponent
                          listOfData={statesData}
                          selectedStates={selectedStates}
                          setSelectedStates={setSelectedStates}
                          setOperatingStates={setOperatingStates}
                        />
                      </View>

                      <View style={{ marginTop: 20 }}>
                        <TouchableOpacity style={styles.addButton} onPress={() => handleStatesSubmit()} >
                          <Text style={[styles.buttonText, { textAlign: 'center' }]}>Submit</Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </View>
                </RBSheet>
              </View>
            }
          </View>
      }
    </SafeAreaView>
  )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  userContainer: {
    width: "100%",
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: COLORS.secondaryWhite,
    borderBottomWidth: 1,
    marginHorizontal: 'auto',
    paddingHorizontal: 20,
    backgroundColor: '#efefef',
    borderRadius: 10,
    paddingVertical: 20,
    marginBottom: 20

  },
  oddBackground: {
    backgroundColor: COLORS.white
  },
  userImageContainer: {
    paddingVertical: 15,
    marginRight: 22
  },
  onlineIndicator: {
    position: 'absolute',
    top: 14,
    right: 2,
    backgroundColor: COLORS.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
    zIndex: 999,
    borderColor: 'white',
    borderWidth: 2
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  userInfoContainer: {
    flexDirection: 'column',
    maxWidth: "80%",
  },
  fullName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,

  },
  lastMessage: {
    fontSize: 14,
    color: 'grey',
  },
  lastMessageTime: {
    fontSize: 12,
    color: COLORS.black
  },
  messageInQueue: {
    fontSize: 12,
    color: 'white'
  },
  buttonContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 6,
    alignItems: "center",
    // marginTop: 30
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold'
  },
})


export default Home