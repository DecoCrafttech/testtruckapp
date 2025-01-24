import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Alert, BackHandler, TouchableOpacity, FlatList, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import HeaderWithoutNotifications from "../../components/HeaderWithoutNotifications";
import { useFocusEffect } from "@react-navigation/native";
import axiosInstance from "../../services/axiosInstance";

const Blogs = () => {
  const [blogData, setBlogData] = useState([]);
  const [blogModal, setBlogModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null); // State to store the selected blog

  const handleBackPress = useCallback(() => {
    Alert.alert('Exit App', 'Are you sure you want to exit?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      {
        text: 'Exit',
        onPress: () => BackHandler.exitApp(),
      },
    ]);
    return true;
  }, []);

  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
      };
    }, [handleBackPress])
  );

  const getBlogs = async () => {
    const payload = {
      page_no: "1",
      data_limit: "10",
    };

    try {
      const response = await axiosInstance.post("/dashboard_blog_post", payload);
      setBlogData(response.data.data.blog_data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getBlogs();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.blog_image_name }}
        style={styles.cardImage}
        resizeMode="contain"
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.heading1}</Text>
        <Text style={styles.cardText}>{item.heading2}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setSelectedBlog(item); // Set the selected blog
              setBlogModal(true);   // Open the modal
            }}
          >
            <Text style={styles.editButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithoutNotifications title="Blogs" />
      <FlatList
        data={blogData}
        renderItem={renderItem}
        keyExtractor={(item) => item.blog_id}
        contentContainerStyle={{ paddingVertical: 10 }}
      />

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={blogModal}
        onRequestClose={() => setBlogModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
              {selectedBlog && (
                <>
                  <Text style={[styles.modalTitle,{textAlign:'left'}]}>{selectedBlog.heading1}</Text>
                  <Text style={[styles.modalText,{textAlign:'left'}]}>
                        {selectedBlog.heading2}
                  </Text>
                  <Image
                    source={{ uri: selectedBlog.blog_image_name }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                </>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setBlogModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  card: {
    width: '90%',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginVertical: 10,
  },
  cardImage: {
    width: '100%',
    height: 300,
  },
  cardBody: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    width: '80%',
    borderRadius: 10,
    elevation: 5,
    // alignItems: 'center',
    maxHeight : "80%"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  modalImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default Blogs;
