import { Alert, BackHandler, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import HeaderWithoutNotifications from "../../components/HeaderWithoutNotifications";
import { useFocusEffect } from "@react-navigation/native";

const Language = () => {

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
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <HeaderWithoutNotifications title="Language" />
      </View>
    </SafeAreaView>
  );
};

export default Language;
