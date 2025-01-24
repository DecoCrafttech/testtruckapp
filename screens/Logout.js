import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LoadNeedsContext } from '../hooks/LoadNeedsContext';

const LocationComponent = () => {

  const navigation = useNavigation()

  const {
    setIsLoggedIn
} = useContext(LoadNeedsContext)

  useEffect(() => {

    Alert.alert("Logout","Are you sure want to logout?",
      [
        {
          
          text : "Yes",
          onPress : () => {
            const logoutFunction = async () => {
              setIsLoggedIn(false)
              await AsyncStorage.removeItem("user_id")
              await AsyncStorage.removeItem("userName")
              await AsyncStorage.removeItem("mobileNumber")
          
              navigation.navigate("Login")
           
          }
          (async () => logoutFunction())()


          }
        },
        {
          text : "Cancel",
          onPress : () => null
        }
      ]
    )

    

   

  },[])

  return(
    <>
      <Text>Logout</Text>
    </>
  )
}
export default LocationComponent;
