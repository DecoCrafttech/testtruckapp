import React from "react";
import { View, Text } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { COLORS } from "../constants";

const BottomSheet = ({ bottomSheetRef }) => {
  return (
    <RBSheet
      ref={bottomSheetRef}
      height={400}
      openDuration={250}
      closeOnDragDown={true}
      closeOnPressBack={true}
      closeOnPressMask={true}
      customStyles={{
        wrapper: {
          backgroundColor: "rgba(0,0,0,0.5)",
        },
        draggableIcon: {
          backgroundColor: COLORS.gray,
          width: 100,
        },
        container: {
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          alignItems: "center", 
          justifyContent: "center", 
          padding: 20,
        },
      }}
    >
      <View>
        <Text style={{ textAlign: "center", fontWeight: "bold", color:COLORS.brand, fontSize:16 }}>
          Your Notifications will be displayed here
        </Text>
      </View>
    </RBSheet>
  );
};

export default BottomSheet;
