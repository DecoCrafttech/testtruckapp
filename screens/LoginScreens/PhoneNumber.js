import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, FONTS, SIZES, images } from '../../constants'
import { StatusBar } from 'expo-status-bar'

const PhoneNumber = () => {
  return (
    <SafeAreaView style={styles.area}>
      <StatusBar hidden/>
      <View style={styles.container}>
         <Image source={images.driverProfile} resizeMode='contain' style={styles.secureLogin}/>
         <View>
            <Text style={{...FONTS.h3, textAlign:'center'}}>Enter your Phone Number</Text>
            <Text style={{...FONTS.body4, textAlign:'center'}}>We will send you a verification code</Text>
            {/* <View style={styles.inputContainer}>
               <TouchableOpacity style={styles.selectFlagContainer} onPress={()=>{}}>
                    <View style={{justifyContent:'center'}}>

                    </View>
               </TouchableOpacity>
            </View> */}
         </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    area:{
        flex:1,
        backgroundColor:COLORS.white
    },
    container:{
        flex:1,
        backgroundColor:COLORS.white,
        padding:16,
        alignItems:'center'
    },
    secureLogin:{
      width:SIZES.width * 0.8,
      height:SIZES.width * 0.8,
      marginBottom:16
    }
})

export default PhoneNumber