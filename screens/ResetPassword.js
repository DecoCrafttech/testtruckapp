import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, BackHandler, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import Container, { Toast } from 'toastify-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../services/axiosInstance';
import Constants from 'expo-constants';






const ResetPassword = () => {

    
  // cdn link
  const cdnLink = Constants.expoConfig?.extra?.REACT_APP_CDN_LINK 

    const navigation = useNavigation()

    const [inputs, setInputs] = useState({
        password: "",
        confirmPassword: "",
    })

    const [currentPage, setCurrentPage] = useState('login')

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isChecked, setIsChecked] = useState(false)

    const [passwordErr, setPasswordErr] = useState("")
    const [confirmPasswordErr, setConfirmPasswordErr] = useState("")


    useFocusEffect(
        React.useCallback(() => {
            BackHandler.addEventListener('hardwareBackPress', handleBackPress)

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', handleBackPress)
            }
        })
    )

    const handleBackPress = () => {
        Alert.alert('Exit', 'Are you sure want to exit?',
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



    const handleChange = (name, value) => {
        setInputs((prevState) => ({
            ...prevState, [name]: value
        }))
    }


    const handleShowPassword = () => {
        setShowPassword(!showPassword)
    }
    const handleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword)
    }




    const handleResetPassword = async (e) => {

        const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/;

        if (!inputs.password.match(regex)) {
            setPasswordErr('Password must be 8-20 characters long, include at least one number, and one special character (!@#$%^&*).');
            return; // Exit the function if the password does not match the regex
        }else{
            setPasswordErr("")
        }

        if (inputs.password !== inputs.confirmPassword) {
            setConfirmPasswordErr('Confirm password should match the password.');
            return; // Exit the function if the passwords do not match
        }else{
            setConfirmPasswordErr("")
        }
        const resetPasswordParams = {
            user_id: `${await AsyncStorage.getItem("user_id")}`,
            "pwd_type" : "forgot_pwd",
            "new_pwd" : `${inputs.password}`
        }
        try {
            const response = await axiosInstance.post("/update_user_password", resetPasswordParams)
            if (response.data.error_code === 0) {
               
                setInputs({
                    password: "",
                    confirmPassword: "",
                })
                Toast.success(response.data.message)
                alert('reset success')

                navigation.navigate('Login')
            } else {
                Toast.error(response.data.message)
            }
        } catch (err) {
            console.log(err)
        }
    }



    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'android');
        setDate(currentDate);
    };

    const showMode = (currentMode) => {
        setShow(!show);
    };




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
                        flexWrap: 'wrap', // Ensure text wraps
                        maxWidth: '90%', // Ensure text does not overflow
                        overflow: 'hidden', }} // Ensure text wraps
                />
            <View >




                {/* Login container */}
                <View style={styles.loginContainer}>
                    <View style={styles.avatarContainer}>
                        <Image
                            style={styles.avatar}
                            source={{uri : `${cdnLink}/truckmessage_round.png`}}
                        />
                    </View>

                    <View style={styles.pageHeadingContainer}>
                        <Text style={[styles.pageHeading]}>Reset Password</Text>
                    </View>


                    <View style={{ marginBottom: 20 }}>
                        <View>
                            <Text style={styles.label}>New Password</Text>
                        </View>
                        <View style={[styles.passwordInputBox]}>
                            <TextInput
                                placeholder='Enter your password'
                                placeholderTextColor='grey'
                                style={[styles.input]}
                                secureTextEntry={showPassword ? false : true}
                                value={inputs.password}
                                onChangeText={(value) => handleChange('password', value)}
                            >
                            </TextInput>
                            <View style={{
                                position: "absolute",
                                right: 12,
                            }}>
                                <Pressable>
                                    {showPassword ?
                                        <Ionicons name="eye" size={30} color="black" onPress={() => handleShowPassword()} />
                                        :
                                        <Ionicons name="eye-off" size={30} color="black" onPress={() => handleShowPassword()} />
                                    }
                                </Pressable>
                            </View>
                        </View>

                        {
                            passwordErr !== "" ? 
                                <Text style={styles.errMessage}>{passwordErr}</Text> 
                                : 
                                null
                        }

                    </View>

                    <View>
                        <View>
                            <Text style={styles.label}>Confirm New Password</Text>
                        </View>
                        <View style={[styles.passwordInputBox]}>
                            <TextInput
                                placeholder='Enter confirm password'
                                placeholderTextColor='grey'
                                style={[styles.input]}
                                secureTextEntry={showConfirmPassword ? false : true}
                                value={inputs.confirmPassword}
                                onChangeText={(value) => handleChange('confirmPassword', value)}
                            >
                            </TextInput>
                            <View style={{
                                position: "absolute",
                                right: 12,
                            }}>
                                <Pressable>
                                    {showConfirmPassword ?
                                        <Ionicons name="eye" size={30} color="black" onPress={() => handleShowConfirmPassword()} />
                                        :
                                        <Ionicons name="eye-off" size={30} color="black" onPress={() => handleShowConfirmPassword()} />
                                    }
                                </Pressable>
                            </View>

                        </View>
                        {
                            confirmPasswordErr !== "" ? 
                                <Text style={styles.errMessage}>{confirmPasswordErr}</Text> 
                                : null
                        }
                    </View>

                    <View>
                        <TouchableOpacity style={styles.buttonContainer} onPress={handleResetPassword}>
                            <Text style={styles.buttonText}>Reset Password</Text>
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
        textAlign: 'center',
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
    errMessage : {
        color : 'red',
        marginTop : 10,
    },  
    buttonContainer: {
        backgroundColor: COLORS.primary,
        borderRadius: 5,
        marginHorizontal: 5,
        paddingVertical: 15,
        borderWidth: 1,
        alignItems: "center",
        marginTop: 30
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold'
    },





})

export default ResetPassword