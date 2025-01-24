import { View, Text, Image, StyleSheet, TouchableOpacity,  ScrollView, Alert } from 'react-native';
import React, { useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS,  SIZES } from '../constants/index.js';
import { OtpInput } from 'react-native-otp-entry';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Container, { Toast } from 'toastify-react-native';
import { LoadNeedsContext } from '../hooks/LoadNeedsContext.js';
import axiosInstance from '../services/axiosInstance.js';
import Constants from 'expo-constants';


const OTPVerification = () => {

    const navigation = useNavigation()

    const [OTP, setOTP] = useState("")


  // cdn link
  const cdnLink = Constants.expoConfig?.extra?.REACT_APP_CDN_LINK 

    const {
        setIsFirstSignup
    } = useContext(LoadNeedsContext)


    const resendClick = async () => {
        Alert.alert("OTP status","OTP sent successfully")
        const resendParams = {
            phone_number: await AsyncStorage.getItem("mobileNumber")
        }
        try {
            await axiosInstance.post("/send_signup_otp", resendParams)
                .then((response) => {
                    if (response.data.error_code === 0) {
                       console.log(response.data.message)
                    } else {
                        Toast.error(response.data.message)
                    }
                }).catch((err) => {
                    console.log(err)
                })
        } catch (err) {
            console.log(err)
        }
    }


    const verifyOTPFunction = async () => {
        const verifyParams = {
            phone_number: `${await AsyncStorage.getItem("mobileNumber")}`,
            otp: `${OTP}`,
        }
        try {

            await axiosInstance.post("/validate_otp", verifyParams)
                .then((response) => {

                    if (response.data.error_code === 1) {
                        Toast.success(response.data.message)
                        setIsFirstSignup(true)
                        navigation.navigate("Main")
                    } else {
                        Toast.error(response.data.message)
                        return
                    }



                }).catch((err) => {
                    console.log(err)
                })

        } catch (err) {
            console.log(err)
        }

    }


    return (
        <ScrollView style={{   backgroundColor:'#fff'}}>
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' }}>
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
                <View style={{ flex: 1, backgroundColor: COLORS.white, padding: 16, alignItems: 'center' }}>
                    {/* <StatusBar hidden /> */}
                    <View style={styles.avatarContainer}>
                            <Image
                                style={styles.avatar}
                                source={{uri : `${cdnLink}/truckmessage_round.png`}}

                            />
                        </View>
                    <Text style={{ fontSize: 20, marginBottom: 15, fontWeight: '900' }}>Enter Verification Code</Text>
                    <View style={{ marginVertical: 15, width: SIZES.width - 72 }}>
                        <OtpInput

                            numberOfDigits={6}
                            onTextChange={(text) => setOTP(text)}
                            focusColor={COLORS.primary}
                            focusStickBlinkingDuration={400}
                            disabled={false}
                            theme={{
                                pinCodeContainerStyle: {
                                    backgroundColor: COLORS.white,
                                    width: 50,
                                    height: 50,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flex: 1,
                                    borderRadius: 12,
                                    margin: 5,
                                    marginBottom: 10

                                }
                            }}

                        />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                        <Text>Didn't receive the code ?</Text>
                        <TouchableOpacity>
                            <Text
                                style={{ color: '#4285F4', fontWeight: 'bold', textDecorationLine: 'underline' }}
                                onPress={resendClick}
                            >
                                {"  "}Resend code</Text>
                        </TouchableOpacity>
                    </View>


                    <View style={{ paddingBottom: 20 }}>
                        <TouchableOpacity style={styles.buttonContainer} onPress={verifyOTPFunction}>
                            <Text style={styles.buttonText}>Verify</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 10,
                                justifyContent: 'center',
                                paddingBottom: 80 
                            }}>
                                <Text style={{ textAlign: 'center' }}>
                                    Registered user?{" "}
                                </Text>
                                <TouchableOpacity>
                                    <Text
                                        style={{ color: '#4285F4', fontWeight: 'bold', textDecorationLine: 'underline' }}
                                        onPress={() => navigation.navigate('Login')}
                                    > Log in</Text>
                                </TouchableOpacity>
                            </View>


                </View>
            </SafeAreaView>
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
     
    },
    btn: {
        backgroundColor: 'brown',
        color: '#fff',
        padding: 12,
        borderRadius: 5,
        textAlign: "center",
        width: "100%"
    },
    buttonContainer: {
        width: 200,
        backgroundColor: COLORS.primary,
        borderRadius: 5,
        marginHorizontal: 5,
        paddingVertical: 15,
        alignItems: "center",
        marginTop: 30,

    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: "bold"
    },
    avatarContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    avatar: {
        width: 180,
        height: 180,
    },
})

export default OTPVerification