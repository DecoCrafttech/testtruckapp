import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { COLORS, icons, images, SIZES } from '../constants'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather, FontAwesome } from '@expo/vector-icons'
import { Bubble, GiftedChat } from 'react-native-gifted-chat'
import { useNavigation } from '@react-navigation/native'
import { LoadNeedsContext } from '../hooks/LoadNeedsContext';


const Chat = ({ username }) => {

    const navigation = useNavigation()
    const {
        currentUser,
        setCurrentUser
      } = useContext(LoadNeedsContext)

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("")

  const handleInputText = (text) => {
    setInputMessage(text)    
  }

  const renderMessage = (props, messageSent) => {
    const currentMessage = props.currentMessage;

    if (currentMessage.user._id === 1) {
      return (
        <View style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'flex-end'
        }}>
          <Bubble
            {...props}
            wrapperStyle={{
              right: {
                backgroundColor: COLORS.primary,
                marginHorizontal: 12,
                marginVertical: 8
              }
            }}
            textStyle={{
              right: {
                color: COLORS.white,
                fontSize:14
              }
            }}
          />
        </View>
      )
    } else {
      return (
        <View style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'flex-start'
        }}>
          <Bubble
            {...props}
            wrapperStyle={{
              left: {
                backgroundColor: 'lightgrey',
                marginHorizontal: 12,
                marginVertical: 8,
                borderRadius : 20
              }
            }}
            textStyle={{
              left: {
                color: COLORS.black,
                fontSize:14
              }
            }}
          />
        </View>
      )
    }
  }

  const receiveOppositeMessage = () => {
    let CurrentTime = new Date().getTime()

    let message = {
      _id: Math.random().toString(36).substring(7),
      text: "This is a reply from the opposite user",
      createdAt: CurrentTime,
      user: { _id: 2 }
    };
    setMessages((prevMessage) =>
      GiftedChat.append(prevMessage, [message])
    )
  }

  const handleSendClick = () => {
    let CurrentTime = new Date().getTime()

    let message = {
      _id: Math.random().toString(36).substring(7),
      text: inputMessage,
      createdAt: CurrentTime,
      user: { _id: 1 }
    };

    setMessages((prevMessage) =>
      GiftedChat.append(prevMessage, [message])
    )

    setInputMessage("")

    setTimeout(receiveOppositeMessage, 2000);
  }

  return (
    <SafeAreaView style={{
      backgroundColor: COLORS.white,
      flex: 1,
    }}>


      {/* Render header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomColor: 'grey',
        borderBottomWidth: 0.2,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginHorizontal: 12 }}
          >
            <Image
              source={icons.arrowLeft}
              style={{
                width: 24,
                height: 24,
                tintColor: COLORS.black
              }}
            />
          </TouchableOpacity>

          <View>
            <Image
              source={currentUser.userImg}
              resizeMode='contain'
              style={{
                width: 48,
                height: 48,
                borderRadius: 999
              }}
            />
            <View style={{
              position: 'absolute',
              width: 10,
              height: 10,
              backgroundColor: COLORS.primary,
              bottom: 0,
              right: 4,
              borderRadius: 5,
              borderWidth: 2,
              borderColor: 'white',
              zIndex: 999
            }}>
            </View>
          </View>


          <View style={{ marginLeft: 16 }}>
            <Text style={{
              fontSize: 14,
              marginBottom: 2
            }}>{currentUser.fullName}</Text>
            <Text style={{
              fontSize: 10,
              color: COLORS.primary
            }}>Online</Text>
          </View>
        </View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <TouchableOpacity style={{
            marginRight: 12
          }}>
            <Feather
              name='video'
              size={24}
              color="grey"
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather
              name='phone'
              size={24}
              color="grey"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Render chat */}
      <GiftedChat
        messages={messages}
        renderInputToolbar={() => { return null }}
        user={{ _id: 1 }}
        minInputToolbarHeight={0}
        renderMessage={renderMessage}
      />

      {/* Render input bar */}
      <View style={styles.inputContainer}>
        <View style={styles.inputMessageContainer}>
          <TextInput
            style={styles.input}
            placeholder='Type here..'
            placeholderTextColor="grey"
            multiline
            numberOfLines={3}
            value={inputMessage}
            onChangeText={handleInputText}
          />
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <TouchableOpacity style={{ marginHorizontal: 10 }}>
              <Image
                source={icons.camera}
                resizeMode='contain'
                style={{
                  width: 20,
                  height: 20,
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginHorizontal: 10 }}>
              <Image
                source={icons.stickyNote}
                resizeMode='contain'
                style={{
                  width: 20,
                  height: 20
                }}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSendClick}
          >
            <FontAwesome
              name='send'
              size={24}
              style={{
                color: COLORS.primary,
              }}
            />
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  inputContainer: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputMessageContainer: {
    height: 54,
    backgroundColor: COLORS.secondaryWhite,
    flexDirection: 'row',
    alignItems: 'center',
    width: SIZES.width - 28,
    borderRadius: 16,
    borderColor: 'rgba(128,128,128,0.4)',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  sendBtn: {
    backgroundColor: COLORS.secondaryWhite,
    marginHorizontal: 6,
    padding: 4,
    borderRadius: 999
  }
})

export default Chat
