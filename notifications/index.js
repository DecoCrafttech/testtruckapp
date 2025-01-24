// app/(tabs)/index.js
import React, { useEffect, useState, useRef } from "react";
import { Alert, Button, Platform, SafeAreaView, StatusBar, TextInput, StyleSheet, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useNotification } from "@/context/NotificationContext";
import * as Notifications from 'expo-notifications';
import { useColorScheme } from 'react-native';

export default function HomeScreen() {
  const { expoPushToken } = useNotification();
  const [message, setMessage] = useState('');
  const [apiResponses, setApiResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();

  const sendNotification = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    setIsLoading(true);

    try {
      // Send to your API
      const apiResponse = await fetch('https://truck.truckmessage.com/send_notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: expoPushToken,
          message: message
        })
      });

      const data = await apiResponse.json();

      const newResponse = {
        timestamp: new Date().toLocaleTimeString(),
        status: apiResponse.ok ? 'success' : 'error',
        message: message,
        response: data
      };

      setApiResponses(prev => [newResponse, ...prev]);

      if (apiResponse.ok) {
        setMessage('');
        Alert.alert('Success', 'Notification sent successfully!');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      const newResponse = {
        timestamp: new Date().toLocaleTimeString(),
        status: 'error',
        message: message,
        response: 'Network error occurred'
      };
      setApiResponses(prev => [newResponse, ...prev]);
      Alert.alert('Error', 'Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* Header Section */}
          <ThemedText style={[styles.header, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
            Push Notifications
          </ThemedText>

          {/* Token Display */}
          <ThemedText style={[styles.tokenLabel, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
            Your Push Token:
          </ThemedText>
          <ThemedText style={[styles.tokenText, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
            {expoPushToken}
          </ThemedText>

          {/* Input Section */}
          <ThemedView style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { color: colorScheme === 'dark' ? 'white' : 'black', backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Enter notification message"
              multiline
              placeholderTextColor={colorScheme === 'dark' ? '#ccc' : '#666'}
            />
            <Button 
              title={isLoading ? "Sending..." : "Send Notification"}
              onPress={sendNotification}
              disabled={isLoading}
            />
          </ThemedView>

          {/* Response History Section */}
          {apiResponses.length > 0 && (
            <ThemedView style={styles.historyContainer}>
              <ThemedText style={[styles.historyHeader, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
                Response History
              </ThemedText>
              {apiResponses.map((response, index) => (
                <ThemedView 
                  key={index} 
                  style={[
                    styles.responseItem,
                    { backgroundColor: colorScheme === 'dark' ? 'black' : 'white' }
                  ]}
                >
                  <ThemedText style={[styles.timestamp, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
                    {response.timestamp}
                  </ThemedText>
                  <ThemedText style={[styles.messageText, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
                    Message: {response.message}
                  </ThemedText>
                  <ThemedText style={[styles.statusText, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
                    Status: {response.status.toUpperCase()}
                  </ThemedText>
                  <ThemedText style={[styles.responseText, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
                    Response: {JSON.stringify(response.response, null, 2)}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  tokenLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tokenText: {
    fontSize: 14,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  historyContainer: {
    marginTop: 20,
  },
  historyHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  responseItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 12,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 12,
  },
});