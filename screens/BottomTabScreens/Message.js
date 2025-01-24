import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ActivityIndicator, ScrollView } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../../constants";
import HeaderWithoutNotifications from "../../components/HeaderWithoutNotifications";
import { LoadNeedsContext } from "../../hooks/LoadNeedsContext";
import Ionicons from '@expo/vector-icons/Ionicons';
import icons from '../../constants/icons.js';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../services/axiosInstance.js";
import Icon from 'react-native-vector-icons/FontAwesome'; // Choose the appropriate icon set



const Message = () => {

  const navigation = useNavigation()

  const {
    setMessageReceiver,
    pageRefresh,
    lastMessageSent,
    setLastMessageSent,
  } = useContext(LoadNeedsContext)



  const [search, setSearch] = useState("")
  const [allPersons, setAllPersons] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [pageLoading, setPageLoading] = useState(false)

  const getChatList = async () => {
    try {
      setPageLoading(true)
      const userIdParams = {
        user_id: await AsyncStorage.getItem("user_id")
      }
      const response = await axiosInstance.post('/get_user_chat_list', userIdParams);

      setPageLoading(false)

      setAllPersons(response.data.data)
      setFilteredUsers(response.data.data)
    } catch (err) {
      console.log(err)
      setPageLoading(false)

    }
  }

  useEffect(() => {

    getChatList()

  }, [pageRefresh])

  const handleSearch = (text) => {
    setSearch(text)
    const filteredResult = allPersons.filter((value) => {
      return value.profile_name.toLowerCase().includes(text.toLowerCase())
    })
    setFilteredUsers(filteredResult)
  }

  const handleNavigateToChat = (item) => {
    navigation.navigate("Chat")
    setMessageReceiver(item)
  }


  const renderItem = ({ item, index }) => {
    return (
      <ScrollView >
        <TouchableOpacity
          key={index}
          onPress={() => handleNavigateToChat(item)}
          style={[
            styles.userContainer,
            styles.oddBackground
          ]}
        >
          <View style={styles.userImageContainer}>
            {item.isOnline && item.isOnline === true && (
              <View style={styles.onlineIndicator} />
            )}
            <Image
              source={{ uri: item.profile_image_name }}
              resizeMode='contain'
              style={styles.userImage}
            />
          </View>

          <View style={{
            flexDirection: 'row',
            width: SIZES.width - 104
          }}>
            <View style={styles.userInfoContainer}>
              <Text style={styles.fullName}>{item.profile_name}</Text>
              {/* <Text style={styles.lastMessage}>{item.lastMessage}</Text> */}
              <View style={{flexDirection : 'row',alignItems : 'center',gap : 5}}>
              <Icon name={lastMessageSent ? "arrow-up" : "arrow-down" } color={COLORS.primary} size={8} />
              <Text style={styles.lastMessage}>{`${item.last_msg.length > 20 ? `${item.last_msg.slice(0,21)}...` : item.last_msg }`}</Text>
              </View>
            </View>

            <View style={{
              position: 'absolute',
              right: 0,
              alignItems: 'center',
            }}>
              <Text style={styles.lastMessageTime}>{item.last_time}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    )
  }



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <HeaderWithoutNotifications title="Message" />


        {
          pageLoading ?
            <View style={{ alignItems: 'center', flex: 1, justifyContent: "center" }}>
              <ActivityIndicator size='large' color={COLORS.primary} />
            </View>
            :
            <>
              {/* Chats */}
              <View style={{ marginBottom: 290 }}>
                <View style={styles.searchBar}>
                  <TouchableOpacity >
                    <Text>
                      <Ionicons
                        name='search-outline'
                        size={24}
                        color='grey'
                      />
                    </Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.searchInput}
                    placeholder='Search contact'
                    value={search}
                    onChangeText={handleSearch}
                  >
                  </TextInput>
                  <TouchableOpacity>
                    <Image
                      source={icons.editPencil}
                      style={{
                        width: 24,
                        height: 24,
                        tintColor: COLORS.gray
                      }}
                    />
                  </TouchableOpacity>
                </View>

                {/* Render Flatlist for chats */}
                <View>
                  <FlatList
                    // data={filteredUsers}
                    data={filteredUsers.sort((a, b) => a.last_time - b.last_time)}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `${item.person_id}_${index}`}  // Use a combination of person_id and index
                  />
                </View>
              </View>
            </>

        }



      </View>
    </SafeAreaView >
  );
};




const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.secondaryGray
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.secondaryWhite,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
    marginHorizontal: 'auto',
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    height: 50,
    width: SIZES.width - 32,
    borderRadius: 7,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    marginHorizontal: 12,
  },
  userContainer: {
    width: "100%",
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: COLORS.secondaryWhite,
    borderBottomWidth: 1,
    marginHorizontal: 'auto',
    paddingHorizontal: 20,
  },
  oddBackground: {
    backgroundColor: COLORS.white
  },
  userImageContainer: {
    paddingVertical: 15,
    marginRight: 22
  },
  onlineIndicator: {
    position: 'absolute',
    top: 14,
    right: 2,
    backgroundColor: COLORS.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
    zIndex: 999,
    borderColor: 'white',
    borderWidth: 2
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  userInfoContainer: {
    flexDirection: 'column',
    maxWidth : "98%"
  },
  fullName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4
  },
  lastMessage: {
    fontSize: 14,
    color: 'grey',
  },
  lastMessageTime: {
    fontSize: 12,
    color: COLORS.black
  },
  messageInQueue: {
    fontSize: 12,
    color: 'white'
  }
})


export default Message;
