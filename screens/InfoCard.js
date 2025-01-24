import React from 'react'

import { View } from "react-native";
import TruckList from "./screens/TruckList";

const InfoCard = () => {
    const truckData = [
        {
          title: "Truck 1",
          fromLocation: "Location A",
          toLocation: "Location B",
          labels: [
            { icon: "local-shipping", text: "Label 1" },
            { icon: "schedule", text: "Label 2" },
          ],
          description: "This is a description for Truck 1.",
          onButton1Press: () => alert("Button 1 pressed for Truck 1"),
          onButton2Press: () => alert("Button 2 pressed for Truck 1"),
        },
        {
          title: "Truck 2",
          fromLocation: "Location C",
          toLocation: "Location D",
          labels: [
            { icon: "local-shipping", text: "Label 3" },
            { icon: "schedule", text: "Label 4" },
          ],
          description: "This is a description for Truck 2.",
          onButton1Press: () => alert("Button 1 pressed for Truck 2"),
          onButton2Press: () => alert("Button 2 pressed for Truck 2"),
        },
       
      ];
  return (
    <View style={{ flex: 1 }}>
      <TruckList truckData={truckData} />
    </View>
  )
}

export default InfoCard