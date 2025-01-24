import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image,  } from 'react-native'
import React, {  useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {  useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import Container, { Toast } from 'toastify-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../services/axiosInstance';
import Constants from 'expo-constants';






const ForgotPassword = () => {


  // cdn link
  const cdnLink = Constants.expoConfig?.extra?.REACT_APP_CDN_LINK 


    const navigation = useNavigation()

    const [mobileNumber, setMobileNumber] = useState("")


    const handleSendOTP = async () => {

        if(mobileNumber === ""){
            alert('Please enter mobile number')
        }

        const OTPParams = {
            "phone_number": `${mobileNumber}`
        }


        try {

            await AsyncStorage.setItem("mobileNumber", `${mobileNumber}`)


            const response = await axiosInstance.post("/send_forgot_pwd_otp", OTPParams)


            if (response.data.error_code === 0) {
                Toast.success(response.data.message)
                await AsyncStorage.setItem("user_id", `${response.data.data.user_id}`)
                navigation.navigate('ResetPasswordOTPVerification')
            } else {
                Toast.error(response.data.message)
            }
        } catch (err) {
            console.log(err)
        }

    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
            <Container
                position="top"
                duration={3000}
                animationIn="slideInDown"
                height="auto"
                width="100%"
                textStyle={{
                    fontSize: 15,
                    flexWrap: 'wrap',
                    maxWidth: '90%',
                    overflow: 'hidden',
                }}
            />
            <View >


                <View style={styles.loginContainer}>
                    <View style={styles.avatarContainer}>
                        <Image
                            style={styles.avatar}
                            source={{ uri: `${cdnLink}/truckmessage_round.png` }}
                        />
                    </View>

                    <View style={styles.pageHeadingContainer}>
                        <Text style={[styles.pageHeading]}>Forgot Password</Text>
                    </View>


                    <View style={styles.inputField}>
                        <View style={styles.mobileNumberInputBox}>
                            <TextInput
                                placeholder='+91'
                                placeholderTextColor='grey'
                                readOnly
                                style={styles.contryCodeInput}></TextInput>
                            <TextInput
                                autoFocus
                                placeholder='Enter your mobile number'
                                placeholderTextColor='grey'
                                inputMode='numeric'
                                style={styles.mobileNumberInput}
                                value={mobileNumber}
                                onChangeText={(text) => setMobileNumber(text)}
                            >
                            </TextInput>
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity style={styles.buttonContainer} onPress={handleSendOTP}>
                            <Text style={styles.buttonText}>Send OTP</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 20,
                        justifyContent: 'center'
                    }}>
                        <Text style={{ textAlign: 'center' }}>
                            Back to {""}
                        </Text>
                        <TouchableOpacity>
                            <Text
                                style={{ color: '#4285F4', fontWeight: 'bold', textDecorationLine: 'underline' }}
                                onPress={() => navigation.navigate('Login')}
                            >Login</Text>
                        </TouchableOpacity>
                    </View>

                </View>

            </View>



        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 22,
        width: "100%",
    },
    avatarContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    avatar: {
        width: 180,
        height: 180,
    },
    loginContainer: {
        borderColor: 'grey',
        borderWidth: 0.2,
        padding: 30,
        borderRadius: 5,
        width: "100%",
    },
    pageHeading: {
        fontSize: 22,
        fontWeight: "bold",
        marginVertical: 12,
        marginBottom: 30,
    },
    signupContainer: {
        marginHorizontal: 20,
        marginTop: 30
    },
    label: {
        fontSize: 14,
        fontWeight: "400",
        marginBottom: 10
    },
    inputField: {
        marginBottom: 15,

    },
    inputBox: {
        width: "100%",
        height: 48,
        backgroundColor: "#fff",
        borderRadius: 5,
        borderColor: 'grey',
        borderWidth: 1
    },
    input: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 15,
    },
    mobileNumberInputBox: {
        width: "100%",
        height: 48,
        backgroundColor: "#fff",
        borderRadius: 5,
        borderColor: 'grey',
        borderWidth: 1,
        flexDirection: 'row'
    },
    contryCodeInput: {
        width: "15%",
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 8,
        borderRightColor: 'grey',
        borderRightWidth: 1
    },
    mobileNumberInput: {
        width: "85%",
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 12,
    },
    passwordInputBox: {
        width: 270,
        height: 48,
        backgroundColor: "#fff",
        borderRadius: 5,
        borderColor: 'grey',
        borderWidth: 1,
        justifyContent: 'center',
    },
    errMessage: {
        color: 'red',
        marginTop: 10
    },
    buttonContainer: {
        backgroundColor: COLORS.primary,
        borderRadius: 5,
        paddingVertical: 15,
        alignItems: "center",
        marginTop: 10
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold'
    },





})

export default ForgotPassword