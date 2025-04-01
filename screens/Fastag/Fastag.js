import { Alert, BackHandler, StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import HeaderWithoutNotifications from "../../components/HeaderWithoutNotifications";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import HeaderWithOutBS from "../../components/HeaderWithOutBS";

const Fastag = () => {

    const navigation = useNavigation();
  

  useFocusEffect(
    React.useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress)

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress)
      }
    })
  )

  const handleBackPress = () => {
    navigation.navigate("Main")
    return true
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithOutBS title="Fastag" />
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
    justifyContent: 'center',
    alignItems: 'center'
  },

});

export default Fastag;
