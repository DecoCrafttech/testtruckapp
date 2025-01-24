import { Platform, Image } from "react-native";
import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { COLORS, icons } from "../constants";
import { Home, Message } from "../screens";
import Profile from "../screens/BottomTabScreens/Profile";
import AsyncStorage from "@react-native-async-storage/async-storage";


const Tab = createBottomTabNavigator();

const BottomTabNavigation = () => {


  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          right: 0,
          left: 0,
          elevation: 0,
          height: Platform.OS === "ios" ? 100 : 70,
          backgroundColor: COLORS.white,
        },
      }}
    >
      <Tab.Screen
        name="BottomTabHome"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Image
                source={focused ? icons.home : icons.homeOutline}
                resizeMode="contain"
                style={{
                  height: 24,
                  width: 24,
                  tintColor: focused ? COLORS.brand : COLORS.brand,
                }}
              />
            );
          },
        }}
      />

      {/* <Tab.Screen
        name="BottomTabMyPosts"
        component={MyPost}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Image
                source={focused ? icons.myPostIcon : icons.myPostIcon}
                resizeMode="contain"
                style={{
                  height: 24,
                  width: 24,
                  tintColor: focused ? COLORS.primary : COLORS.black,
                }}
              />
            );
          },
        }}
      /> */}

      <Tab.Screen
        name="DrawerMessage"
        component={Message}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Image
                source={focused ? icons.message : icons.messageOutline}
                resizeMode="contain"
                style={{
                  height: 27,
                  width: 27,
                  tintColor: focused ? COLORS.brand : COLORS.brand,
                }}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Image
                source={focused ? icons.user : icons.userOutline}
                resizeMode="contain"
                style={{
                  height: 24,
                  width: 24,
                  tintColor: focused ? COLORS.brand : COLORS.brand,
                }}
              />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;
