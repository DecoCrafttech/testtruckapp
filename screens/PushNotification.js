import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const PushNotification = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pushToken, setPushToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const sendPushNotification = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Error', 'Please enter both title and body');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        token: pushToken,
        message: body,
      };

      const response = await axios.post('https://truck.truckmessage.com/send_notification', payload);
      console.log('Notification sent successfully:', response.data);
      Alert.alert('Success', 'Notification sent successfully!');
      setBody('');
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.tokenLabel}>Your Push Token:</Text>
      <Text style={styles.tokenText} selectable>{pushToken || 'Loading...'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter notification title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter notification body"
        value={body}
        onChangeText={setBody}
        multiline
      />
      <Button 
        title={isLoading ? "Sending..." : "Send Notification"} 
        onPress={sendPushNotification}
        disabled={isLoading || !pushToken}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tokenLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tokenText: {
    fontSize: 14,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
});

export default PushNotification;
