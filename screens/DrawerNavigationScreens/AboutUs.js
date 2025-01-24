import { Alert, BackHandler, StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import HeaderWithoutNotifications from "../../components/HeaderWithoutNotifications";
import { useFocusEffect } from "@react-navigation/native";

const AboutUs = () => {

  useFocusEffect(
    React.useCallback(() => {
       BackHandler.addEventListener('hardwareBackPress',handleBackPress)

       return() => {
         BackHandler.removeEventListener('hardwareBackPress',handleBackPress)
       }
    })
  )

  const handleBackPress = () => {
    Alert.alert('Exit App','Are you sure want to exit?',
      [
        {
          text : 'Cancel',
          onPress : () => null,
          style : 'cancel'
        },
        {
          text : 'Exit',
          onPress : () => BackHandler.exitApp()
        }
      ]
    )
    return true
  }

  return (
    <SafeAreaView style={styles.container}>
    <HeaderWithoutNotifications title="About us" />
         <View style={styles.container2}>
        <Text>Coming soon</Text>
    </View>
  </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container2: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent : 'center',
    alignItems:'center'
  },
  
});

export default AboutUs;
