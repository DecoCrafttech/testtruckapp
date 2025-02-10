import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import { useNavigation } from "@react-navigation/native";
import { COLORS, icons, SIZES } from "../constants";
import { LoadNeedsContext } from "../hooks/LoadNeedsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import axiosInstance from "../services/axiosInstance";
import axios from "axios";

const Chat = () => {
  const navigation = useNavigation();
  const {
    currentUser,
    messageReceiver,
    pageRefresh,
    setPageRefresh,
    lastMessageSent,
    setLastMessageSent,
  } = useContext(LoadNeedsContext);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  const [chatMessagesRefresh, setChatMessagesRefresh] = useState(false)
  const [chatMessageLoading, setChatMessageLoading] = useState(false)
  const [sendClickLoading, setSendClickLoading] = useState(false)




  useEffect(() => {

    const fetchChatMessages = async () => {
      try {

        setChatMessageLoading(true)

        let requiredParams;
        if (messageReceiver.driver_id) {
          requiredParams = {
            user_id: await AsyncStorage.getItem("user_id"),
            person_id: messageReceiver.person_id ? messageReceiver?.person_id : messageReceiver?.user_id,
            ref_flag: "Driver",
            ref_id: messageReceiver.driver_id
          }
        }
        else if (messageReceiver.load_id) {
          requiredParams = {
            user_id: await AsyncStorage.getItem("user_id"),
            person_id: messageReceiver.person_id ? messageReceiver?.person_id : messageReceiver?.user_id,
            ref_flag: "Load",
            ref_id: messageReceiver.load_id

          }
        } else if (messageReceiver.truck_id) {
          requiredParams = {
            user_id: await AsyncStorage.getItem("user_id"),
            person_id: messageReceiver.person_id ? messageReceiver?.person_id : messageReceiver?.user_id,
            ref_flag: "Truck",
            ref_id: messageReceiver.truck_id
          }
        }
        else if (messageReceiver.buy_sell_id) {
          requiredParams = {
            user_id: await AsyncStorage.getItem("user_id"),
            person_id: messageReceiver.person_id ? messageReceiver?.person_id : messageReceiver?.user_id,
            ref_flag: "Buy and sell",
            ref_id: messageReceiver.buy_sell_id
          }
        }
        else {
          requiredParams = {
            user_id: await AsyncStorage.getItem("user_id"),
            person_id: messageReceiver.person_id ? messageReceiver?.person_id : messageReceiver?.user_id,
          }
        }

        const userId = await AsyncStorage.getItem("user_id");
        const response = await axiosInstance.post("/get_user_chat_message_list", requiredParams);

        if (response.data.data[0].chat_id === 1) {
          setLastMessageSent(true)
        } else {
          setLastMessageSent(false)
        }

        const transformedMessages = response.data.data.map((msg, index) => {
          // Check if msg.message exists and is a string before splitting
          if (msg.message && typeof msg.message === "string") {
            return {
              _id: index,
              text: msg.message.split(",").join("\n"),
              createdAt: new Date(),
              user: {
                _id: msg.chat_id === parseInt(userId) ? 1 : 2,
                name:
                  msg.chat_id === parseInt(userId)
                    ? "You"
                    : messageReceiver?.profile_name || "Unknown",
                avatar:
                  msg.chat_id === parseInt(userId)
                    ? currentUser?.avatar || null
                    : messageReceiver?.avatar || null,
              },
            };
          } else {
            // If msg.message is undefined or invalid, handle it here (return default message or skip)
            return {
              _id: index,
              text: "Invalid message",
              createdAt: new Date(),
              user: {
                _id: msg.chat_id === parseInt(userId) ? 1 : 2,
                name:
                  msg.chat_id === parseInt(userId)
                    ? "You"
                    : messageReceiver?.profile_name || "Unknown",
                avatar:
                  msg.chat_id === parseInt(userId)
                    ? currentUser?.avatar || null
                    : messageReceiver?.avatar || null,
              },
            };
          }
        });




        setChatMessageLoading(false)

        setMessages(transformedMessages);
      } catch (err) {
        console.error(err);
        setChatMessageLoading(false)

      }
    };


    fetchChatMessages();

    // if (messageReceiver && currentUser) {

    // }
  }, [messageReceiver, currentUser, chatMessagesRefresh]);

  const handleInputText = (text) => setInputMessage(text);

  const handleSendClick = async () => {
    try {
      setSendClickLoading(true)
      const userId = await AsyncStorage.getItem("user_id");
      const currentTime = new Date().getTime();

      await axiosInstance.post("/user_chat_message", {
        user_id: userId,
        person_id: messageReceiver.person_id ? messageReceiver?.person_id : messageReceiver?.user_id,
        message: inputMessage,
      });

      const newMessage = {
        _id: Math.random().toString(36).substring(7),
        text: inputMessage,
        createdAt: currentTime,
        user: { _id: 1 },
      };

      setPageRefresh(!pageRefresh)
      setMessages((prevMessages) => GiftedChat.append(prevMessages, [newMessage]));
      setInputMessage("");
      setSendClickLoading(false)

    } catch (err) {
      setSendClickLoading(false)
      console.error(err);
    }
  };


  const sendPushNotification = async (receiverId) => {
    const payload = {
      appId: 24234,
      appToken: 'cdRv8YPtH70BLWHy8pwHkS',
      title: "Notification from Truck Message",
      body: inputMessage,
      dateSent: new Date(),
      // pushData: { yourProperty: 'yourPropertyValue' },
      // bigPictureURL: bigPictureURL,
      subID: receiverId, // This is the user identifier

    };

    axios.post('https://app.nativenotify.com/api/notification', payload)
      .then(response => {
        console.log('Notification sent successfully:', response.data);
      })
      .catch(error => {
        console.error('Error sending notification:', error);
      });
  };

  const renderMessage = (props) => {
    const { currentMessage } = props;
    const isCurrentUser = currentMessage.user._id === 1;

    return (
      <>
        {
          chatMessageLoading ?
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <ActivityIndicator size={"large"} />
            </View>
            :
            <View
              style={{
                flex: 1,
                flexDirection: isCurrentUser ? "row-reverse" : "row",
                justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                marginVertical: 8,
              }}
            >
              <Bubble
                {...props}
                wrapperStyle={{
                  right: {
                    backgroundColor: COLORS.primary,
                    borderRadius: 20,
                    marginHorizontal: 12,
                  },
                  left: {
                    backgroundColor: COLORS.secondaryWhite,
                    borderRadius: 20,
                    marginHorizontal: 12,
                  },
                }}
                textStyle={{
                  right: {
                    color: COLORS.white,
                    fontSize: 14,
                  },
                  left: {
                    color: COLORS.black,
                    fontSize: 14,
                  },
                }}
              />
            </View>
        }
      </>
    );
  };

  return (
    <SafeAreaView style={{ backgroundColor: COLORS.white, flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
            <Image
              source={icons.arrowLeft}
              style={styles.headerBackIcon}
            />
          </TouchableOpacity>
          {/* <View>
            <Image
              source={{uri : messageReceiver.profile_image_name}}
              resizeMode="contain"
              style={styles.headerAvatar}
            />
            <View style={styles.headerOnlineIndicator} />
          </View> */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{messageReceiver.profile_name}</Text>
            {/* <Text style={styles.headerStatus}>Online</Text> */}
          </View>
        </View>
        <TouchableOpacity >
          <EvilIcons name="refresh" size={30} color="black" onPress={() => setChatMessagesRefresh(!chatMessagesRefresh)} />
        </TouchableOpacity>
      </View>

      {/* Chat */}

      {
        chatMessageLoading ?
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size={"large"} />
          </View>
          :

          <GiftedChat
            messages={messages}
            renderInputToolbar={() => (
              <>
                {/* Input Bar */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputMessageContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Type here.."
                      placeholderTextColor="grey"
                      multiline
                      numberOfLines={3}
                      value={inputMessage}
                      onChangeText={handleInputText}
                      editable={sendClickLoading === false ? true : false}
                    />
                    <View style={styles.inputIcons}>
                      <TouchableOpacity style={styles.iconBtn}>
                        <Image source={icons.camera} style={styles.icon} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn}>
                        <Image source={icons.stickyNote} style={styles.icon} />
                      </TouchableOpacity>
                    </View>

                    {
                      inputMessage.length === 0 ?
                        <TouchableOpacity style={styles.sendBtn} disabled onPress={handleSendClick}>
                          <FontAwesome name="send" size={24} color={COLORS.gray} />
                        </TouchableOpacity>
                        :
                        sendClickLoading === true ?
                          <TouchableOpacity disabled style={[styles.buttonContainer, { opacity: 1,marginRight:10}]} >
                            <ActivityIndicator size="small" color={COLORS.primary} />
                          </TouchableOpacity>
                          :
                          <TouchableOpacity style={styles.sendBtn} onPress={handleSendClick}>
                            <FontAwesome name="send" size={24} color={COLORS.primary} />
                          </TouchableOpacity>

                    }
                  </View>
                </View>
              </>
            )}
            user={{ _id: 1 }}
            minInputToolbarHeight={0}
            renderMessage={renderMessage}
          />
      }


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomColor: "grey",
    borderBottomWidth: 0.2,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerBackBtn: {
    marginHorizontal: 12,
  },
  headerBackIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.black,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
  },
  headerOnlineIndicator: {
    position: "absolute",
    width: 10,
    height: 10,
    backgroundColor: COLORS.primary,
    bottom: 0,
    right: 4,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "white",
    zIndex: 999,
  },
  headerTextContainer: {
    marginLeft: 16,
  },
  headerName: {
    fontSize: 14,
    marginBottom: 2,
  },
  headerStatus: {
    fontSize: 10,
    color: COLORS.primary,
  },
  inputContainer: {
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  inputMessageContainer: {
    height: 54,
    backgroundColor: COLORS.secondaryWhite,
    flexDirection: "row",
    alignItems: "center",
    width: SIZES.width - 28,
    borderRadius: 16,
    borderColor: "rgba(128,128,128,0.4)",
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  inputIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    marginHorizontal: 10,
  },
  icon: {
    width: 20,
    height: 20,
  },
  sendBtn: {
    backgroundColor: COLORS.secondaryWhite,
    marginHorizontal: 6,
    padding: 4,
    borderRadius: 999,
  },
});

export default Chat;
