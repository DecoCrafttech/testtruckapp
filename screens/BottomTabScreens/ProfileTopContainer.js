import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Image, Text, Modal, TextInput, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Fontisto from '@expo/vector-icons/Fontisto';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import axios, { all } from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import MultiSelectComponent from '../../components/MultiSelectComponent';
import { statesData } from '../../constants/cityAndState';
import { ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RBSheet from 'react-native-raw-bottom-sheet';
import { COLORS } from '../../constants';
import { Toast } from 'toastify-react-native';
import axiosInstance from '../../services/axiosInstance';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LoadNeedsContext } from '../../hooks/LoadNeedsContext';
import RNPickerSelect from 'react-native-picker-select';
import Constants from 'expo-constants';
import Checkbox from 'expo-checkbox';





const ProfileTopContainer = () => {

    const cdnLink = Constants.expoConfig?.extra?.REACT_NATIVE_APP_API_URL


    const {
        setUserStatesFromProfile
    } = useContext(LoadNeedsContext)

    const refRBSheetCitites = useRef()
    const refRBSheetStates = useRef()
    const refRBSheetViewStates = useRef()

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [dob, setDob] = useState("");
    const [category, setCategory] = useState("Category");
    const [profileImage, setProfileImage] = useState("https://dmq79vlehx2uk.cloudfront.net/user.png")
    const [isImagePicked, setImagePicked] = useState(false)

    const [userCities, setUserCities] = useState([])
    const [userStates, setUserStates] = useState([])





    const [selectedStates, setSelectedStates] = useState([]);
    const [operatingStates, setOperatingStates] = useState([])
    const [allStates, setAllStates] = useState([])

    const [editSelectedStates, setEditSelectedStates] = useState([])
    const [editStates, setEditStates] = useState([])
    const [editStatesClick, setEditStatesClick] = useState(false)
    const [updateSelectedStates, setUpdateSelectedStates] = useState([])
    const [isChecked, setIsChecked] = useState(false)
    const [isAllSelected, setIsAllSelected] = useState(false); // State to track "Select All"




    const [pageLoading, setPageLoading] = useState(false)
    const [pageRefresh, setPageRefresh] = useState(false)
    // update states
    const [updatedName, setUpdatedName] = useState("");
    const [updatedMobile, setUpdatedMobile] = useState("");
    const [updatedDob, setUpdatedDob] = useState(new Date());
    const [updatedCategory, setUpdatedCategory] = useState("Category");

    const [updatedProfileImage, setUpdatedProfileImage] = useState(null)
    const [updateImageModal, setUpdateImageModal] = useState(false)


    const [updatedOperatingCities, setUpdatedOperatingCities] = useState([])
    const [updatedOperatingStates, setUpdatedOperatingStates] = useState([])

    const [date, setDate] = useState(new Date())
    const [show, setShow] = useState(false);



    const categoryData = [
        { label: 'Lorry owners', value: 'lorry_owners' },
        { label: 'Logistics', value: 'logistics' },
        { label: 'Lorry contractors', value: 'lorry_contractors' },
        { label: 'Load booking agent', value: 'load_booking_agent' },
        { label: 'Driver', value: 'driver' },
        { label: 'Lorry Buy & Sell dealers / Owners', value: 'Lorry Buy &Sell dealers / Owners' },
    ]



    const handleSelectAll = () => {
        if (isAllSelected) {
            // If already selected, deselect all
            setSelectedStates([]);
            setAllStates([]);
            setIsAllSelected(false);
            setEditSelectedStates([])
        } else {
            // Select all state IDs
            const allStateNames = statesData.map(state => state.name);
            setAllStates(allStateNames);
            setIsAllSelected(true);
        }
    };

    const handleCheckBox = () => {
        setIsChecked(!isChecked)
    }



    useEffect(() => {
        const getProfilePage = async () => {
            const getUserProfileParams = {
                user_id: await AsyncStorage.getItem("user_id")
            }
            const response = await axiosInstance.post("/get_user_profile", getUserProfileParams)
            if (response.data.error_code === 0) {
                setTimeout(() => {
                    setPageLoading(true)
                }, 2000);
                setName(response.data.data[1].name)
                setMobile(response.data.data[1].phone_number)
                setCategory(response.data.data[1].category)
                setDob(response.data.data[1].date_of_birth)
                setUserCities(response.data.data[1].operating_city)
                setProfileImage(response.data.data[1].profile_image_name)
            } else {
                console.log(response.data.message)
            }
        }
        (async () => getProfilePage())()
    }, [pageRefresh])




    const getStates = async () => {
        try {
            const updateProfileParams = {
                "user_id": `${await AsyncStorage.getItem("user_id")}`,
            }

            const res = await axiosInstance.post("/get_user_state_list", updateProfileParams)
            if (res.data.error_code === 0) {
                setUserStates(res.data.data[0].state_list)
                setUserStatesFromProfile(res.data.data[0].state_list)
            } else {
                console.log(res.data.message)
            }
        } catch (err) {
            console.log(err)
        }
    }




    useEffect(() => {
        (async () => getStates())()
    }, [])




    const handleEditPress = () => {
        setEditing(true);
        setUpdatedName(name)
        setUpdatedMobile(mobile)
        setUpdatedDob(dob)
        setUpdatedCategory(category)
    };



    const handleCancel = () => {
        setEditing(false);
    };

    const handleUpdateImageModalCancel = () => {
        setUpdateImageModal(false)
    }


    const pickProfileImage = async () => {
        // Request permission to access the media library
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Sorry, we need media library permissions to make this work!');
            return;
        }

        // Launch the image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled) {
            const { uri } = result.assets[0];
            setUpdatedProfileImage(uri);
            setImagePicked(true)
        }
    };



    const updateProfileImageAPI = async (uri) => {
        const url = `${cdnLink}/update_profile_image`; // Replace with your server URL

        const formData = new FormData();
        formData.append('profile_image', {
            uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
            type: 'image/jpeg', // Adjust if you are dealing with different image types
            name: 'profile_image',
        });
        formData.append("user_id", `${await AsyncStorage.getItem("user_id")}`)

        try {
            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.error_code === 0) {
                setProfileImage(response.data.data[0].profile_image_name)
                setUpdateImageModal(false)
                Toast.success('Image uploaded successfully!');
                setImagePicked(false)

            } else {
                Toast.error(response.data.message)
            }

        } catch (error) {
            Toast.error('Image upload failed. Please try again.');
            console.error('Error uploading image:', error);
        }
    };








    const handleSave = async () => {
        try {
            let localUri = updatedProfileImage;
            if (localUri) {
                let filename = localUri.split('/').pop();
                let match = /\.(\w+)$/.exec(filename);
                let type = match ? `image/${match[1]}` : `image`;
                let formData = new FormData();
                formData.append('profile_image', { uri: localUri, name: filename, type });
                formData.append('profile_image', filename);
            }

            const updateProfileParams = {
                "user_id": `${await AsyncStorage.getItem("user_id")}`,
                "first_name": `${updatedName}`,
                "date_of_birth": `${updatedDob}`,
                "phone_number": `${updatedMobile}`,
                "category": `${updatedCategory}`,
                "operating_city": [],
                "state": []
            }

            const res = await axiosInstance.post("/update_profile", updateProfileParams, {
                headers: {
                    "Content-Type": "application/json"
                }
            })


            if (res.data.error_code === 0) {
                setEditing(false);
                setPageRefresh(!pageRefresh)
            } else {
                console.log(res.data.message)
            }
        } catch (err) {
            r
            console.log(err)
        }
    };


    // Date picker
    const showDatePicker = () => {
        setShow(true)
    }
    const onChange = (event, userSelectedDate) => {
        setShow(false);
        if (userSelectedDate !== undefined) {
            setDate(userSelectedDate);
            setUpdatedDob(userSelectedDate.toISOString().split('T')[0])
        }
    };

    const handleStatesSubmit = async () => {
        try {
            const addStatesParams = {
                "user_id": `${await AsyncStorage.getItem("user_id")}`,
                "state_name": allStates.length === 0 ? operatingStates : allStates
            }

            const res = await axiosInstance.post("/user_state_entry", addStatesParams)

            if (res.data.error_code === 0) {
                setPageRefresh(!pageRefresh)
                refRBSheetStates.current.close()
                setOperatingStates([])
                setSelectedStates([])
                getStates()
            } else {
                console.log(res.data.message)
            }
        } catch (err) {
            console.log(err)
        }
    }



    const handleEditStates = () => {
        if (userStates.length !== 0) {
            // setIsAllSelected(true)
            setEditStatesClick(true);
            setEditSelectedStates(userStates.map(stateName => {
                const stateObj = statesData.find(state => state.name === stateName);
                return stateObj ? stateObj.id : null;
            }).filter(id => id !== null));
            setEditStates(userStates)
        } else {
            setIsAllSelected(false)
            setAllStates([])
            setEditStatesClick(true);
            setEditSelectedStates(userStates.map(stateName => {
                const stateObj = statesData.find(state => state.name === stateName);
                return stateObj ? stateObj.id : null;
            }).filter(id => id !== null));
            setEditStates(userStates)
        }



    };


    const handleEditStatesChange = async (selectedItemIds) => {
        // Log previously selected states
        const prevSelectedStateNames = editSelectedStates.map(id => {
            const state = statesData.find(state => state.id === id);
            return state ? state.name : null;
        }).filter(name => name !== null);


        // Update selected states
        setEditSelectedStates(selectedItemIds);

        // Log currently selected states
        const selectedStateNames = selectedItemIds.map(id => {
            const state = statesData.find(state => state.id === id);
            return state ? state.name : null;
        }).filter(name => name !== null);
        setUpdateSelectedStates(selectedStateNames)
    };


    const handleUpdateStates = async () => {
        if (editSelectedStates.length === 0 && allStates.length === 0) {
            alert("Please select atleast one state")
            return
        } else {
            try {
                const removeStatesParams = {
                    "user_id": `${await AsyncStorage.getItem("user_id")}`,
                    "state_name": allStates.length !== 0 ? allStates : editStates
                }

                const res = await axiosInstance.post("/remove_user_state_list", removeStatesParams)

                if (res.data.error_code === 0) {
                    await updateStatesFunction()
                } else {
                    console.log(res.data.message)
                }
            } catch (err) {
                console.log(err)
            }
        }
    }


    const updateStatesFunction = async () => {
        if (updateSelectedStates.length === 0 && allStates.length === 0) {
            return
        } else {

            try {
                const updateStatesParams = {
                    "user_id": `${await AsyncStorage.getItem("user_id")}`,
                    "state_name": allStates.length !== 0 ? allStates : updateSelectedStates
                }

                const res = await axiosInstance.post("/user_state_entry", updateStatesParams)

                if (res.data.error_code === 0) {
                    setPageRefresh(!pageRefresh)
                    setEditStatesClick(false)
                    getStates()
                } else {
                    console.log(res.data.message)
                }
            } catch (err) {
                console.log(err)
            }
        }



    }


    return (
        <View style={styles.container}>

            <View style={styles.header}>
                {
                    pageLoading ?
                        <>
                            <TouchableOpacity style={styles.editIcon} onPress={() => handleEditPress()}>
                                <Feather name="edit" size={24} color="black" />
                            </TouchableOpacity>
                            <View>

                                <Image
                                    style={styles.avatar}
                                    source={{ uri: profileImage }} />

                                <Feather style={styles.modalImageEditIcon}
                                    name="edit"
                                    size={20}
                                    color="#000"
                                    onPress={() => setUpdateImageModal(true)}
                                />
                            </View>
                            <View style={styles.info}>
                                <Text style={styles.name} >{name}</Text>
                                <Text style={[styles.phone]}>
                                    <Text><FontAwesome name="phone" size={15} color="black" /></Text>
                                    <Text style={{ marginLeft: 50 }}>{`   +91${mobile}`}</Text>
                                </Text>
                                <Text style={[styles.phone]}>
                                    <Text><Fontisto name="date" size={15} color="black" /></Text>
                                    <Text style={{ marginLeft: 50 }}>{`  ${dob}`}</Text>
                                </Text>
                                <Text style={[styles.phone]}>
                                    <Text><MaterialIcons name="category" size={15} color="black" /></Text>
                                    <Text style={{ marginLeft: 50 }}>{`  ${category}`}</Text>
                                </Text>
                            </View>
                        </>
                        :
                        <View style={{ marginHorizontal: 'auto', height: 150, justifyContent: "center" }}>
                            <ActivityIndicator size='large' color={COLORS.primary} />
                        </View>
                }
            </View>


            <View style={styles.stats}>
                {
                    userStates.length === 0 ?
                        null
                        :
                        <TouchableOpacity
                            style={[styles.addButton, { flex: 1, marginEnd: 10 }]}
                            onPress={() => {
                                setEditStatesClick(false);
                                refRBSheetViewStates.current.open()
                                getStates()
                            }} >
                            <Text style={[styles.buttonText, { textAlign: 'center' }]}>View states</Text>
                        </TouchableOpacity>
                }
                {
                    userStates.length === 0 ?
                        <TouchableOpacity style={[styles.addButton, { width: '100%' }]} onPress={() => {
                            setIsAllSelected(false)
                            setAllStates([])
                            refRBSheetStates.current.open()
                        }} >
                            <Text style={[styles.buttonText, { textAlign: 'center' }]}>Add States</Text>
                        </TouchableOpacity>
                        :
                        null
                }

            </View>

            <Modal visible={editing} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>

                    <View style={styles.modalContent}>
                        <Text style={{ fontSize: 17, fontWeight: 'bold', marginBottom: 20 }}>Edit Profile</Text>
                        <TextInput
                            style={styles.input}
                            value={updatedName}
                            onChangeText={(text) => setUpdatedName(text)}
                            placeholder="Name"
                        />
                        <TextInput
                            editable={false}
                            style={styles.input}
                            value={updatedMobile}
                            onChangeText={(text) => setUpdatedMobile(text)}
                            placeholder="Mobile Number"
                        />
                        <View >
                            <TextInput
                                placeholder={`Enter your date of birth`}
                                placeholderTextColor='grey'
                                style={styles.input}
                                onPress={showDatePicker}
                                value={updatedDob}
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


                        <View style={{ borderColor: "#ccc", borderWidth: 1, padding: 0, borderRadius: 5, marginBottom: 10, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <RNPickerSelect
                                onValueChange={(value) => setUpdatedCategory(value)}
                                items={categoryData}
                                value={updatedCategory}
                                placeholder={{
                                    label: 'Select category',
                                    value: null,
                                    color: 'grey',
                                }}
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                                <Text style={[styles.buttonText, { textAlign: "center" }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                                <Text style={[styles.buttonText, { textAlign: "center" }]}>Save</Text>
                            </TouchableOpacity>
                           
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={updateImageModal} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={{ fontSize: 17, fontWeight: 'bold', marginBottom: 20 }}>Edit Profile</Text>
                        <View>
                            <View>
                                <Image
                                    style={[styles.avatar, { alignItems: 'center', marginHorizontal: 'auto' }]}
                                    source={{ uri: updatedProfileImage || profileImage }} />
                                <Feather style={[styles.modalImageEditIcon, { position: 'absolute', bottom: 0, left: "65%" }]}
                                    name="edit"
                                    size={20}
                                    color="#000"
                                    onPress={() => pickProfileImage()}
                                />
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={() => isImagePicked === true ? updateProfileImageAPI(updatedProfileImage) : alert("Please choose image first")}>
                                <Text style={[styles.buttonText, { textAlign: 'center' }]}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleUpdateImageModalCancel}>
                                <Text style={[styles.buttonText, { textAlign: 'center' }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View>
                <RBSheet
                    ref={refRBSheetCitites}
                    height={400}
                    openDuration={250}
                    closeOnDragDown={true}
                    closeOnPressBack={true}
                    closeOnPressMask={true}
                    customStyles={{
                        wrapper: {
                            backgroundColor: "rgba(0,0,0,0.5)",
                        },
                        draggableIcon: {
                            backgroundColor: COLORS.gray,
                            width: 100,
                        },
                        container: {
                            borderTopLeftRadius: 30,
                            borderTopRightRadius: 30,
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 20,
                        },
                    }}
                >
                    <View>
                        <ScrollView>

                            <View style={styles.inputField}>
                                <View>
                                    <Text style={styles.label}>Operating States</Text>
                                </View>
                                <View>
                                    <MultiSelectComponent
                                        listOfData={statesData}
                                        selectedStates={selectedStates}
                                        setSelectedStates={setSelectedStates}
                                        setOperatingStates={setOperatingStates}
                                    />
                                </View>
                            </View>

                            <View>
                                <Text
                                    style={{
                                        textAlign: "center",
                                        fontWeight: "bold",
                                        color: COLORS.brand,
                                        fontSize: 16
                                    }}
                                >Your Operating Cities {'\n'}</Text>
                            </View>
                            <Text style={{ textAlign: "center", fontWeight: "500", color: COLORS.secondary, fontSize: 14 }}>
                                {
                                    updatedOperatingCities.length === 0 ?
                                        <View>
                                            {
                                                userCities.map((city, index) => {
                                                    return (
                                                        <React.Fragment key={index}>
                                                            <Text>{city}</Text>
                                                        </React.Fragment>
                                                    )
                                                })
                                            }
                                        </View>
                                        :
                                        <>
                                            {
                                                updatedOperatingCities.map((city, index) => {
                                                    return (
                                                        <React.Fragment key={index}>
                                                            <Text style={{ marginVertical: 30 }}>{city} {"\n"}</Text>
                                                        </React.Fragment>
                                                    )
                                                })
                                            }
                                        </>
                                }

                            </Text>
                        </ScrollView>
                    </View>
                </RBSheet>
            </View>


            <View>
                <RBSheet
                    ref={refRBSheetStates}
                    height={500}
                    openDuration={250}
                    closeOnDragDown={true}
                    closeOnPressBack={true}
                    closeOnPressMask={true}
                    customStyles={{
                        wrapper: {
                            backgroundColor: "rgba(0,0,0,0.5)",
                        },
                        draggableIcon: {
                            backgroundColor: COLORS.gray,
                            width: 100,
                        },
                        container: {
                            borderTopLeftRadius: 30,
                            borderTopRightRadius: 30,
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 20,
                        },
                    }}
                >
                    <View>
                        <ScrollView>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 18, color: COLORS.primary }}>Add States</Text>
                                <Text
                                    onPress={handleSelectAll} // Toggle all states
                                    style={{
                                        fontSize: 12,
                                        fontWeight: "700",
                                        marginBottom: 18,
                                        color: isAllSelected ? COLORS.primary : COLORS.secondary, // Indicate selection visually
                                    }}
                                >
                                    {isAllSelected ? "Deselect All" : "Select all"}
                                </Text>
                            </View>
                            {
                                allStates.length === 0 ?
                                    <View style={{ width: 320 }}>
                                        <MultiSelectComponent
                                            listOfData={statesData}
                                            selectedStates={selectedStates}
                                            setSelectedStates={(newSelection) => {
                                                setSelectedStates(newSelection);
                                                setIsAllSelected(newSelection.length === statesData.length); // Adjust "Select All" state dynamically
                                            }}
                                            setOperatingStates={setOperatingStates}
                                        />
                                    </View>
                                    :
                                    <View style={{ width: 320 }}>
                                        {
                                            allStates.map((value, index) => {
                                                return (
                                                    <View key={index}>
                                                        <Text>{value}</Text>
                                                    </View>
                                                )
                                            })
                                        }
                                    </View>
                            }

                            <View style={{ marginTop: 20 }}>
                                <TouchableOpacity style={styles.addButton} onPress={() => handleStatesSubmit()} >
                                    <Text style={[styles.buttonText, { textAlign: 'center' }]}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </RBSheet>
            </View >


            <View>
                <RBSheet
                    ref={refRBSheetViewStates}
                    height={500}
                    openDuration={250}
                    closeOnDragDown={true}
                    closeOnPressBack={true}
                    closeOnPressMask={true}
                    customStyles={{
                        wrapper: {
                            backgroundColor: "rgba(0,0,0,0.5)",
                        },
                        draggableIcon: {
                            backgroundColor: COLORS.gray,
                            width: 100,
                        },
                        container: {
                            borderTopLeftRadius: 30,
                            borderTopRightRadius: 30,
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 20,
                        },
                    }}
                >
                    <View>
                        <ScrollView>
                            <View style={{ width: 320 }}>
                                {
                                    editStatesClick === true ?
                                        <>
                                            {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                <Text
                                                    onPress={handleSelectAll} // Toggle all states
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight: "700",
                                                        marginBottom: 18,
                                                        color: editSelectedStates.length !== 0 ? COLORS.primary : COLORS.secondary, // Indicate selection visually
                                                    }}
                                                >
                                                    {editSelectedStates.length !== 0 || allStates.length !== 0 || isAllSelected === true ? "Remove all" : null}
                                                </Text>
                                            </View> */}


                                            {
                                                allStates.length === 0 ?
                                                    <View style={{ width: 320 }}>
                                                        <SectionedMultiSelect
                                                            items={statesData}
                                                            IconRenderer={Icon}
                                                            uniqueKey="id"
                                                            searchPlaceholderText="Search state"
                                                            selectedText="selected"
                                                            selectText="Select"
                                                            confirmText="Done"
                                                            onSelectedItemsChange={handleEditStatesChange}  // Call to update selected items
                                                            selectedItems={editSelectedStates}  // Initialize with current user states
                                                            styles={{
                                                                backdrop: styles.multiSelectBackdrop,
                                                                selectToggle: styles.multiSelectBox,
                                                                chipContainer: styles.multiSelectChipContainer,
                                                                chipText: styles.multiSelectChipText,
                                                                selectToggleText: styles.selectToggleText,
                                                                selectedItemText: styles.selectedItemText,
                                                                selectText: styles.selectText,
                                                                button: { backgroundColor: '#CE093A' },
                                                            }}
                                                        />
                                                    </View>
                                                    :
                                                    <View style={{ width: 320 }}>
                                                        <Text
                                                            style={{
                                                                fontWeight: "bold",
                                                                color: COLORS.brand,
                                                                fontSize: 16,
                                                            }}
                                                        >Your selected all states {'\n'}
                                                        </Text>
                                                        {
                                                            statesData.map((value, index) => {
                                                                return (
                                                                    <View key={value.id}>

                                                                        <Text>{value.name}</Text>
                                                                    </View>
                                                                )
                                                            })
                                                        }
                                                    </View>
                                            }


                                            <View style={{ marginTop: 20 }}>
                                                {
                                                    editSelectedStates.length >= 0 && allStates.length === 0 ?
                                                        <TouchableOpacity onPress={handleSelectAll} style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                                            <View style={styles.checkboxContainer}>
                                                                <Checkbox
                                                                    value={isChecked ? true : false}
                                                                    // onValueChange={handleCheckBox}
                                                                    color={COLORS.defaultPrimary}
                                                                />
                                                                <Text
                                                                    // Toggle all states
                                                                    style={{
                                                                        fontSize: 12,
                                                                        fontWeight: "700",
                                                                        color: COLORS.secondary, // Indicate selection visually
                                                                    }}
                                                                >
                                                                    Select all
                                                                </Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                        : <TouchableOpacity onPress={handleSelectAll} style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                                            <View style={styles.checkboxContainer}>
                                                                <Checkbox
                                                                    value={isAllSelected ? true : false}
                                                                    // onValueChange={handleCheckBox}
                                                                    color={COLORS.defaultPrimary}
                                                                />
                                                                <Text
                                                                    // Toggle all states
                                                                    style={{
                                                                        fontSize: 12,
                                                                        fontWeight: "700",
                                                                        color: COLORS.secondary, // Indicate selection visually
                                                                    }}
                                                                >
                                                                    Select all
                                                                </Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                }
                                                <TouchableOpacity style={styles.addButton} onPress={() => handleUpdateStates()} >
                                                    <Text style={[styles.buttonText, { textAlign: 'center' }]}>Update</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </>
                                        : null
                                }

                                <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
                                    <Text
                                        style={{
                                            fontWeight: "bold",
                                            color: COLORS.brand,
                                            fontSize: 16,
                                            opacity: editStatesClick ? 0.3 : 1
                                        }}
                                    >Your Operating States {'\n'}
                                    </Text>
                                    <Text
                                        onPress={() => handleEditStates()}
                                        style={{ opacity: editStatesClick ? 0.3 : 1, pointerEvents: editStatesClick ? 'none' : 'auto' }}
                                    >
                                        <Feather style={[styles.modalImageEditIcon, { position: 'absolute', bottom: 0, left: "65%" }]}
                                            name="edit"
                                            size={20}
                                            color="#000"
                                        />

                                    </Text>

                                </View>

                            </View>
                            <Text style={{ fontWeight: "500", color: COLORS.secondary, fontSize: 14, opacity: editStatesClick ? 0.3 : 1 }}>
                                {
                                    updatedOperatingStates.length === 0 ?
                                        <>
                                            {
                                                userStates.map((state, index) => {
                                                    return (
                                                        <React.Fragment key={index}>
                                                            <Text style={{ marginTop: 50 }}>{state} {"\n"}</Text>
                                                        </React.Fragment>
                                                    )
                                                })
                                            }
                                        </>
                                        :
                                        <>
                                            {
                                                updatedOperatingStates.map((state, index) => {
                                                    return (
                                                        <React.Fragment key={index}>
                                                            <Text style={{ marginTop: 50 }}>{state} {"\n"}</Text>
                                                        </React.Fragment>
                                                    )
                                                })
                                            }
                                        </>

                                }

                            </Text>
                        </ScrollView>
                    </View>
                </RBSheet>
            </View>
        </View >
    );
};

const styles = {
    container: {
        backgroundColor: '#F1F2FF',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    editIcon: {
        position: 'absolute',
        right: 15,
        top: 10
    },
    header: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingVertical: 10,
        borderWidth: 0.5,
        borderColor: '#ccc',
        marginHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#fff',

    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 25,
    },
    modalAvatar: {
        width: 80,
        height: 80,
        borderRadius: 3,
        marginBottom: 20,
        marginHorizontal: 'auto',
        position: 'relative'
    },
    modalImageEditIcon: {
        position: 'absolute',
        right: "0%",
        bottom: "0%",
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 5,

    },
    info: {
        marginLeft: 20,
    },
    editButtonContainer: {
        backgroundColor: '#0066cc',
        borderRadius: 5,
        marginTop: 12,
        marginHorizontal: 5,
        paddingVertical: 6,
        borderWidth: 1,
        alignItems: "center",
    },
    editButtonText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',

    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        maxWidth: '80%',
    },
    phone: {
        marginBottom: 10,
        marginHorizontal: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dob: {
        marginHorizontal: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    username: {
        color: '#999',
        fontSize: 16,
        marginBottom: 5,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    stat: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        color: '#999',
        fontSize: 14,
    },
    statValue: {
        fontSize: 16,
    },
    bio: {
        padding: 20,
        fontSize: 16,
        color: '#333',
    },
    headerContainer: {
        alignItems: "center",
    },
    coverPhoto: {
        width: "100%",
        height: 200,
    },
    profileContainer: {
        alignItems: "center",
        marginTop: -50,
    },
    profilePhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    nameText: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 10,
    },
    bioContainer: {
        padding: 15,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        gap: 8

    },
    bioText: {
        fontSize: 16,
    },
    statsContainer: {
        flexDirection: "row",
        marginTop: 20,
        marginBottom: 20,
    },
    statContainer: {
        alignItems: "center",
        flex: 1,
    },
    statCount: {
        fontSize: 20,
        fontWeight: "bold",
    },
    button: {
        backgroundColor: "#0066cc",
        borderRadius: 5,
        padding: 10,
        marginHorizontal: 20,
        marginTop: 10,
    },
    buttonText: {
        fontSize: 16,
        color: "#fff",
        textAlign: "center",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        fontSize: 14,
    },
    multiSelectComponent: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        fontSize: 14,
    },
    placeholderStyle: {
        fontSize: 14,
        color: 'grey'
    },
    selectedTextStyle: {
        fontSize: 14,
    },
    itemTextStyle: {
        fontSize: 14,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
        alignItems: 'center',
        marginHorizontal: 20

    },
    saveButton: {
        backgroundColor: "#0066cc",
        width: "50%",
    },
    cancelButton: {
        backgroundColor: "#999",
        width: "50%",

    },
    addButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },

    multiSelectBackdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.01)',
    },
    multiSelectBox: {
        borderWidth: 1,
        borderRadius: 8,
        borderColor: 'grey',
        padding: 10,
        paddingLeft: 15,
        marginBottom: 4,
    },
    selectToggleText: {
        color: '#000',
        fontSize: 14
    },
    selectText: {
        color: 'red'
    },
    selectedItemText: {
        color: COLORS.primary,
    },
    multiSelectChipContainer: {
        borderWidth: 0,
        backgroundColor: '#ddd',
        borderRadius: 8,
    },
    multiSelectChipText: {
        color: '#222',
        fontSize: 12,
    }
};

export default ProfileTopContainer;
