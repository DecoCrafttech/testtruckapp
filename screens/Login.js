import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, BackHandler, Alert, ActivityIndicator, Platform } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import Container, { Toast } from 'toastify-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../services/axiosInstance';
import { LoadNeedsContext } from '../hooks/LoadNeedsContext';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';






const Login = () => {

    const {
        setIsLoggedIn,
        setUserStatesFromProfile,
    } = useContext(LoadNeedsContext)

    const navigation = useNavigation()

    const [inputs, setInputs] = useState({
        mobileNumber: "",
        password: "",
    })

    const [pageLoading, setPageLoading] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [loginClick, setLoginClick] = useState(false)
    const [pushToken, setPushToken] = useState(null)

    useEffect(() => {

        setInputs({
            mobileNumber: "",
            password: "",
        })

        const getLoginStatus = async () => {
            const userId = await AsyncStorage.getItem("user_id");
            if (userId) {
                (async () => getStates())()
                navigation.navigate("Main");
            } else {
                navigation.navigate("Login");
            }
        }

        setTimeout(() => {
            (async () => getLoginStatus())()
        }, 1500);

        setTimeout(() => {
            setPageLoading(false)
        }, 4000);

        const registerForPushNotifications = async () => {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                Toast.error('Failed to get push token for push notification!');
                return;
            }

            const token = (await Notifications.getExpoPushTokenAsync()).data;
            await AsyncStorage.setItem("pushToken", token)
            setPushToken(token);
            console.log("Generated Push Token:", token);
        };

        registerForPushNotifications();
    }, [])

    useEffect(() => {
        registerForPushNotifications();
      }, []);

    const registerForPushNotifications = async () => {
        try {
            // 1. Check if it's a physical device
            if (!Device.isDevice) {
                throw new Error('Must use physical device for push notifications');
            }

            // 2. Set up Android channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            // 3. Check/request permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                throw new Error('Permission not granted for push notifications');
            }

            // 4. Get project ID and push token
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ??
                Constants?.easConfig?.projectId;

            if (!projectId) {
                throw new Error('Project ID not found');
            }

            const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            setPushToken(token);

        } catch (error) {
            console.error('Error getting push token:', error);
            Alert.alert('Error', error.message);
        }
    };

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

    const getStates = async () => {
        try {
            const updateProfileParams = {
                "user_id": `${await AsyncStorage.getItem("user_id")}`,
            }

            const res = await axiosInstance.post("/get_user_state_list", updateProfileParams)
            if (res.data.error_code === 0) {
                setUserStatesFromProfile(res.data.data[0].state_list)
            } 
        } catch (err) {
            console.log(err)
        }
    }


    

    const handleLogInClick = async (e) => {

        if (
            inputs.mobileNumber === "" ||
            inputs.password === ""
        ) {
            alert('Please fill all the details')
            return
        } else {
            const LogInParams = {
                "username": `${inputs.mobileNumber}`,
                "password": `${inputs.password}`,
                "user_token": pushToken
            }
            
            try {
                setLoginClick(true) 

                await AsyncStorage.setItem("mobileNumber", `${inputs.mobileNumber}`)

                const response = await axiosInstance.post("/login", LogInParams)

                if (response.data.error_code === 0) {
                    setLoginClick(false)
                    setInputs({
                        mobileNumber: "",
                        password: "",
                    })

                    

                    // Toast.success(response.data.message)
                    await AsyncStorage.setItem("userName", `${response.data.data[0].first_name}`)
                    await AsyncStorage.setItem("user_id", `${response.data.data[0].id}`)

                    setIsLoggedIn(true);
                    (async () => getStates())()
                    navigation.navigate('Main')

                } else {
                    setLoginClick(false)
                    alert(response.data.message)
                }
            } catch (err) {
                setLoginClick(false)
                console.log(err)
            }
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
                    flexWrap: 'wrap', // Ensure text wraps
                    maxWidth: '90%', // Ensure text does not overflow
                    overflow: 'hidden',
                }} // Ensure text wraps
            />

            {
                pageLoading ?
                    <>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </>
                    :
                    <>
                        {/* Login container */}
                        <View style={styles.loginContainer}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    style={styles.avatar}
                                    source={{ uri: "https://dmq79vlehx2uk.cloudfront.net/truckmessage_round (1).png" }}
                                />
                            </View>

                            <View style={styles.pageHeadingContainer}>
                                <Text style={[styles.pageHeading]}>Login</Text>
                            </View>

                            <View style={styles.inputField}>
                                <View>
                                    <Text style={styles.label}>Phone Number</Text>
                                </View>
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
                                        maxLength={10}
                                        style={styles.mobileNumberInput}
                                        value={inputs.mobileNumber}
                                        onChangeText={(value) => handleChange('mobileNumber', value)}
                                    >
                                    </TextInput>
                                </View>
                            </View>

                            <View>
                                <View>
                                    <Text style={styles.label}>Password</Text>
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
                            </View>

                            <View>
                                {
                                    loginClick ?
                                        <TouchableOpacity disabled style={[styles.buttonContainer, { opacity: 0.5 }]} >
                                            <ActivityIndicator size="small" color="#fff" />
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity style={styles.buttonContainer} onPress={handleLogInClick}>
                                            <Text style={styles.buttonText}>Login</Text>
                                        </TouchableOpacity>
                                }
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 20,
                                justifyContent: 'center'
                            }}>
                                <Text style={{ textAlign: 'center' }}>
                                    Forgot Password? {" "}
                                </Text>
                                <TouchableOpacity>
                                    <Text
                                        style={{ color: '#4285F4', fontWeight: 'bold', textDecorationLine: 'underline' }}
                                        onPress={() => navigation.navigate("ForgotPassword")}
                                    >Reset here</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 10,
                                justifyContent: 'center'
                            }}>
                                <Text style={{ textAlign: 'center' }}>
                                    New user? {" "}
                                </Text>
                                <TouchableOpacity>
                                    <Text
                                        style={{ color: '#4285F4', fontWeight: 'bold', textDecorationLine: 'underline' }}
                                        onPress={() => navigation.navigate('SignUp')}
                                    >Sign up</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </>
            }


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
        padding: 22,
        borderRadius: 5,
        width: "100%",
    },
    pageHeading: {
        fontSize: 22,
        fontWeight: "bold",
        marginVertical: 12,
        marginBottom: 30,
        textAlign: 'left'
    },
    signupContainer: {
        marginHorizontal: 20,
        marginTop: 30
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
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
        width: "100%",
        height: 48,
        backgroundColor: "#fff",
        borderRadius: 5,
        borderColor: 'grey',
        borderWidth: 1,
        justifyContent: 'center',
    },
    buttonContainer: {
        backgroundColor: COLORS.primary,
        borderRadius: 5,
        paddingVertical: 15,
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

export default Login