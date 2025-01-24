import React from "react";
import { StyleSheet, View, ScrollView, Text, Image } from "react-native";
import TruckCard from "../TruckCard";
import { TouchableOpacity } from "react-native";
import { COLORS } from "../../constants";
import Constants from 'expo-constants';



const TruckDetails = ({ navigation, filteredTrucks,availableTruckPage }) => {

  // cdn link

  const cdnLink = Constants.expoConfig?.extra?.REACT_APP_CDN_LINK 



  return (
    <ScrollView contentContainerStyle={styles.container}>
      {filteredTrucks.length > 0 ? (
        filteredTrucks.reverse().map((truck, index) => (
          <TruckCard
            key={index}
            post={truck.post}
            profileName={truck.profileName}
            companyName={truck.companyName}
            title={truck.title}
            fromLocation={truck.fromLocation}
            toLocation={truck.toLocation}
            labels={truck.labels}
            description={truck.description}
            onButton1Press={truck.onButton1Press}
            onButton2Press={truck.onButton2Press}
            updatedTime={truck.updatedTime}
            availableTruckPage={availableTruckPage}
            isAadhaarVerified={truck.isAadhaarVerified}
            truckSize={truck.truckSize}
            nameOfTheTransport={truck.nameOfTheTransport}

          />
        ))
      ) : (
        <View style={styles.noResultContainer}>
          <View>
            <Image
               source={{ uri: `${cdnLink}/Folder_empty.png` }}
              width={50}
              height={50}
              resizeMode="center"
            />
          </View>
          <Text style={styles.noResultsText}>No records</Text>
          <TouchableOpacity>
            <Text
              style={{ color: '#fff', width: "100%", padding: 10, paddingHorizontal: 20, borderRadius: 5, textAlign: 'center', fontWeight: 'bold', fontSize: 16, backgroundColor: COLORS.primary }}
              onPress={() => navigation.navigate('LoadNeeds')}
            > Click here to post a load</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,

  },
  noResultContainer: {
    marginTop: 200,
    alignItems: 'center',
    justifyContent: 'center',
    flex:1
  },
  noResultsText: {
    textAlign: "center",
    marginBottom: 30,
    color: "grey",
    fontSize: 16,
  },
});

export default TruckDetails;
