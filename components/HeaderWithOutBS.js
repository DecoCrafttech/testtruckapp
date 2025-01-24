import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants";
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomButton from "./CustomButton";

const HeaderWithOutBS = ({ title,handleBackPress,isPetrolBunkPage,onPress }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => {
            if(handleBackPress){
              handleBackPress()
              navigation.goBack()
            }
            else{
              navigation.goBack()
            }
          } }
          style={styles.iconContainer}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text
          style={styles.title}
        >
          {title}
        </Text>
      </View>
      
    {
      isPetrolBunkPage === "true" ? 

      <Text onPress={onPress} style={{position:'absolute',right:0,color:COLORS.white,fontWeight:'700',backgroundColor:COLORS.primary,paddingVertical:6,paddingHorizontal:10,borderRadius:5}}>Add petrol bunk +</Text>

      : null
    }

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginHorizontal: 16,
  },
  iconContainer: {
    height: 45,
    width: 45,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginLeft: 12,
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.brand,
    
  },
});

export default HeaderWithOutBS;
``