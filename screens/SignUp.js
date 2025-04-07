import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Alert, Linking } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import CustomButton from '../components/CustomButton';
import Container, { Toast } from 'toastify-react-native';
import axiosInstance from '../services/axiosInstance';
import { BackHandler } from 'react-native';
import { COLORS } from '../constants';
import { LoadNeedsContext } from '../hooks/LoadNeedsContext';
import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications';








const SignUp = () => {

    // cdn link
    const cdnLink = Constants.expoConfig?.extra?.REACT_APP_CDN_LINK

    const {
        setIsSignedUp
    } = useContext(LoadNeedsContext)

    const navigation = useNavigation()

    const [inputs, setInputs] = useState({
        name: "",
        dob: "",
        mobileNumber: "",
        email: "",
        state: "",
        pincode: "",
        operatingCity: "",
        password: "",
        confirmPassword: "",
    })

    const [operatingStates, setOperatingStates] = useState([])

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isChecked, setIsChecked] = useState(false)
    const [category, setCategory] = useState("");


    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);

    const [pushToken, setPushToken] = useState(null);

    useEffect(() => {
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
            setPushToken(token);
            console.log("Generated Push Token:", token);
        };

        registerForPushNotifications();
    }, []);





    useFocusEffect(
        React.useCallback(() => {
            BackHandler.addEventListener('hardwareBackPress', handleBackPress)

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', handleBackPress)
            }
        })
    )


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

    const handleChange = (name, value) => {
        setInputs((prevState) => ({
            ...prevState, [name]: value
        }))
    }


    // Date picker
    const showDatePicker = () => {
        setShow(true)
    }

    const onChange = (event, selectedDate) => {
        setShow(false);

        if (selectedDate !== undefined) {
            setDate(selectedDate);


            setInputs((prevState) => ({
                ...inputs, dob: selectedDate
            })
            )
        }
    };



    // Dropdown data
    const categoryData = [
        { label: 'Lorry owners', category: 'Lorry owners' },
        { label: 'Logistics', category: 'Logistics' },
        { label: 'Lorry contractors', category: 'Lorry contractors' },
        { label: 'Load booking agent', category: 'Load booking agent' },
        { label: 'Driver', category: 'Driver' },
        { label: 'Lorry Buy & Sell dealers / Owners', category: 'Lorry Buy &Sell dealers / Owners' },
        { label: 'Petrol bunk Owner', category: 'Petrol bunk Owner' },
    ];


    const handleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const handleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword)
    }

    const handleCheckBox = () => {
        setIsChecked(!isChecked)
    }

    const handleRegisterClick = async (e) => {
        if (
            inputs.name === "" ||
            inputs.dob === "" ||
            inputs.mobileNumber === "" ||
            inputs.email === "" ||
            category === "" ||
            inputs.pincode === "" ||
            inputs.password === "" ||
            inputs.confirmPassword === ""

        ) {
            alert('Please fill all the details')
            return
        } else if (isChecked === false) {
            alert('Please accept the terms and conditions')
            return
        }

        else {

            const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/;

            if (!inputs.password.match(regex)) {
                alert('Password must be 8-20 characters long, include at least one number, and one special character (!@#$%^&*).');
                return; // Exit the function if the password does not match the regex
            }

            if (inputs.password !== inputs.confirmPassword) {
                alert('Confirm password should match the password.');
                return; // Exit the function if the passwords do not match
            }


            const signupParams = {
                first_name: inputs.name,
                date_of_birth: `${inputs.dob.toISOString().split('T')[0]}`,
                phone_number: inputs.mobileNumber,
                email: inputs.email,
                category: category,
                operating_city: "",
                state: operatingStates,
                pincode: inputs.pincode,
                password: inputs.password,
                user_token: pushToken,
            }

            try {

                const response = await axiosInstance.post("/registration", signupParams)
                if (response.data.error_code === 0) {
                    if (response.data.message === "Phone Number already registered!") {
                        alert(response.data.message)
                        return
                    }
                    await AsyncStorage.setItem("userName", `${inputs.name}`)
                    await AsyncStorage.setItem("user_id", `${response.data.data[0].id}`)
                    await AsyncStorage.setItem("mobileNumber", `${inputs.mobileNumber}`)
                    setIsSignedUp(true)
                    setCategory("")
                    setInputs({
                        name: "",
                        dob: "",
                        mobileNumber: "",
                        state: "",
                        operatingCity: "",
                        password: "",
                        confirmPassword: "",
                    })

                    sendOTP()
                    navigation.navigate("OTPVerification")
                } else {
                    alert(response.data.message)
                }



            } catch (err) {
                console.log(err)
            }


        }


    }




    const sendOTP = async (e) => {
        const OTPParams = {
            "phone_number": `${inputs.mobileNumber}`,
        }
        try {
            const response = await axiosInstance.post("/send_signup_otp", OTPParams)
            if (response.data.error_code === 0) {
                alert(response.data.message)
            } else {
                alert(response.data.message)
            }
        } catch (err) {
            console.log(err)
        }
    }



    return (
        <SafeAreaProvider>
            <SafeAreaView>
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

                <ScrollView style={{ backgroundColor: '#fff' }}>
                    <View style={styles.container}>
                        {/* <StatusBar hidden /> */}

                        <View style={styles.avatarContainer}>
                            <Image
                                style={styles.avatar}
                                source={{ uri: `${cdnLink}/truckmessage_round (1).png` }}
                            />
                        </View>

                        <View style={styles.pageHeadingContainer}>
                            <Text style={[styles.pageHeading]}>Registration</Text>
                        </View>

                        {/* Signup container */}
                        <View style={styles.signupContainer}>
                            <View style={styles.inputField}>
                                <View>
                                    <Text style={styles.label}>Name</Text>
                                </View>
                                <View style={styles.inputBox}>
                                    <TextInput
                                        autoFocus
                                        // ref={inputRef}
                                        placeholder='Enter your name'
                                        placeholderTextColor='grey'
                                        style={styles.input}
                                        value={inputs.name}
                                        onChangeText={(value) => handleChange('name', value)}
                                    >
                                    </TextInput>
                                </View>
                            </View>

                            <View style={styles.inputField}>
                                <View>
                                    <Text style={styles.label} >Date of Birth</Text>
                                </View>
                                <View style={styles.inputBox} >
                                    <TextInput
                                        placeholder={`Enter your date of birth`}
                                        placeholderTextColor='grey'
                                        style={styles.input}
                                        onPress={showDatePicker}
                                        value={inputs.dob !== "" ? inputs.dob.toLocaleDateString("en-GB", { year: 'numeric', month: '2-digit', day: '2-digit' }) : ""}
                                    >
                                    </TextInput>
                                    {show === true ?
                                        <DateTimePicker
                                            value={date}
                                            mode="date"
                                            display="default"
                                            onChange={onChange}
                                        /> : null
                                    }

                                </View>
                            </View>

                            <View style={styles.inputField}>
                                <View>
                                    <Text style={styles.label}>Phone Number</Text>
                                </View>
                                <View style={styles.categoryInputBox}>
                                    <TextInput
                                        placeholder='+91'
                                        placeholderTextColor='grey'
                                        readOnly
                                        style={styles.contryCodeInput}></TextInput>
                                    <TextInput
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


                            <View style={styles.inputField}>
                                <View>
                                    <Text style={styles.label}>E-mail</Text>
                                </View>
                                <View style={styles.inputBox}>
                                    <TextInput
                                        placeholder='Enter your email'
                                        placeholderTextColor='grey'
                                        keyboardType='email-address'
                                        style={styles.input}
                                        value={inputs.email}
                                        onChangeText={(value) => handleChange('email', value)}
                                    >
                                    </TextInput>
                                </View>
                            </View>


                            <View style={styles.inputField}>
                                <View>
                                    <Text style={styles.label}>Category</Text>
                                </View>
                                <View style={styles.categoryInputBox}>
                                    <Dropdown
                                        style={styles.dropdown}
                                        placeholderStyle={styles.placeholderStyle}
                                        selectedTextStyle={styles.selectedTextStyle}
                                        inputSearchStyle={styles.inputSearchStyle}
                                        iconStyle={styles.iconStyle}
                                        itemTextStyle={styles.itemTextStyle}
                                        itemContainerStyle={styles.itemContainerStyle}
                                        data={categoryData}
                                        maxHeight={300}
                                        labelField="label"
                                        valueField="category"
                                        placeholder="Select item"
                                        searchPlaceholder="Search..."
                                        value={category}
                                        onChange={item => setCategory(item.category)}
                                    />
                                </View>
                            </View>


                            <View style={styles.inputField}>
                                <View>
                                    <Text style={styles.label}>Pincode</Text>
                                </View>
                                <View style={styles.inputBox}>
                                    <TextInput
                                        keyboardType='number-pad'
                                        placeholder='Enter your pincode'
                                        maxLength={6}
                                        placeholderTextColor='grey'
                                        style={styles.input}
                                        value={inputs.pincode}
                                        onChangeText={(value) => handleChange('pincode', value)}
                                    >
                                    </TextInput>
                                </View>
                            </View>

                            <View style={styles.inputField}>
                                <View>
                                    <Text style={styles.label}>Password</Text>
                                </View>
                                <View style={styles.passwordInputBox}>
                                    <TextInput
                                        placeholder='Enter your password'
                                        placeholderTextColor='grey'
                                        style={styles.input}
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

                            <View style={styles.inputField}>
                                <View>
                                    <Text style={styles.label}>Confirm Password</Text>
                                </View>
                                <View style={styles.passwordInputBox}>
                                    <TextInput
                                        placeholder='Enter your password'
                                        placeholderTextColor='grey'
                                        style={styles.input}
                                        secureTextEntry={showConfirmPassword ? false : true}
                                        value={inputs.confirmPassword}
                                        onChangeText={(value) => handleChange('confirmPassword', value)}
                                    >
                                    </TextInput>
                                    <View style={{
                                        position: "absolute",
                                        right: 12,
                                    }}>
                                        <Pressable >
                                            {showConfirmPassword ?
                                                <Ionicons name="eye" size={30} color="black" onPress={() => handleShowConfirmPassword()} />
                                                :
                                                <Ionicons name="eye-off" size={30} color="black" onPress={() => handleShowConfirmPassword()} />
                                            }
                                        </Pressable>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.checkboxContainer}>
                                <Checkbox
                                    value={isChecked ? true : false}
                                    onValueChange={handleCheckBox}
                                    color={COLORS.defaultPrimary}
                                />
                                <Text
                                    onPress={handleCheckBox}
                                    style={{ paddingLeft: 12 }}
                                >I agree to the
                                    <Text
                                        style={{ color: '#4285F4', fontWeight: 'bold', textDecorationLine: 'underline' }}
                                        onPress={() => Linking.openURL('https://truckmessage.com/privacy-policy-2/')}
                                    > Privacy policy</Text>{" "}
                                    and
                                    <Text
                                        style={{ color: '#4285F4', fontWeight: 'bold', textDecorationLine: 'underline' }}
                                        onPress={() => Linking.openURL('https://truckmessage.com/terms-and-conditions/')}
                                    > T & C</Text>
                                </Text>
                            </View>

                            <CustomButton title="Register" onPress={handleRegisterClick} />
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 10,
                                justifyContent: 'center',
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



                    </View>

                </ScrollView>



            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginVertical: 20,
    },
    pageHeading: {
        fontSize: 22,
        fontWeight: "bold",
        marginVertical: 12,
        marginHorizontal: 20
    },
    avatarContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    avatar: {
        width: 180,
        height: 180,
    },
    signupContainer: {
        marginHorizontal: 20,
        marginTop: 15
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
    categoryInputBox: {
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
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30
    },
    datePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30
    },
    datePicker: {
        width: 320,
        height: 260,
        backgroundColor: 'white',
    },
    dropdown: {
        fontSize: 14,
        width: "100%",
        borderBottomColor: 'gray',
        paddingLeft: 12,
    },
    icon: {
        marginRight: 5,
    },
    placeholderStyle: {
        fontSize: 14,
        color: 'grey'
    },
    selectedTextStyle: {
        fontSize: 14,
    },
    iconStyle: {
        width: 20,
        height: 20,
        marginRight: 15,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 14,
    },
    itemContainerStyle: {

    },
    itemTextStyle: {
        fontSize: 14,
    },
    buttonContainer: {
        backgroundColor: '#2196F3',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },


})

export default SignUp