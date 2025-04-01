import { View, Text, TouchableOpacity, Image, StyleSheet, Linking } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { COLORS, icons } from "../constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Ionicons from '@expo/vector-icons/Ionicons';


const Header = ({ title, onPress, hasNotifications }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          style={styles.iconContainer}
        >
          <Image resizeMode="contain" style={styles.icon} source={icons.menu} />
        </TouchableOpacity>
        <Text
          style={{
            marginLeft: 12,
            fontSize: 17,
            fontWeight: "bold",
            color: COLORS.brand,
          }}
        >
          {title}
        </Text>
      </View>

      <View style={styles.rightIconsContainer}>
        <TouchableOpacity onPress={() => Linking.openURL(`tel: +919876543210`)} style={styles.helpButton}>
          <Ionicons name="call" size={20} color="#0d6efd" />
          <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>


        {hasNotifications ? (
          <TouchableOpacity onPress={onPress} style={styles.iconContainer}>
            <MaterialCommunityIcons name="bell-badge" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onPress} style={styles.iconContainer}>
            <Image resizeMode="contain" style={styles.icon} source={icons.bell} />
          </TouchableOpacity>
        )}
      </View>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    paddingBottom: 12,
    marginHorizontal: 16,
  },
  formIconContainer: {
    height: 45,
    width: 45,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    marginRight: 20
  },
  iconContainer: {
    height: 45,
    width: 45,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  icon: {
    height: 24,
    width: 24,
    tintColor: COLORS.black,
  },
  rightIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,  // Adjust the spacing between icons
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0d6efd",
  },
  helpText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: "#0d6efd",
  },

});
export default Header;
