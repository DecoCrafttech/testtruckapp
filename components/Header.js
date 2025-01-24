import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { COLORS, icons } from "../constants";
import AntDesign from '@expo/vector-icons/AntDesign';
import { MaterialCommunityIcons } from "@expo/vector-icons";


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
      {

        hasNotifications ?
          <TouchableOpacity onPress={onPress} style={styles.iconContainer}>
            <MaterialCommunityIcons name="bell-badge" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          :
          <TouchableOpacity onPress={onPress} style={styles.iconContainer}>
            <Image resizeMode="contain" style={styles.icon} source={icons.bell} />
          </TouchableOpacity>
      }

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
});
export default Header;
