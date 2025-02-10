import { StyleSheet, Text, View, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import HeaderWithoutNotifications from "../../components/HeaderWithoutNotifications";

const DrawerRefer = () => {
  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithoutNotifications title="Refer" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.contentContainer}>
          <Text style={styles.headline}>
            Built for the Trucking Community, Powered by Trust
          </Text>
          <Text style={styles.description}>
            More than just an app, Truck Message is a partner for truck owners, drivers,
            and logistics professionals. We understand the everyday challenges of the
            industry and offer free services to help you overcome them. From booking
            loads to saving on fuel, we are committed to supporting the community that
            drives India forward.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  contentContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 10,
  },
  headline: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "start",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "start",
    lineHeight: 24,
  },
});

export default DrawerRefer;