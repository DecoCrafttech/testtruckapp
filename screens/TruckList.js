import React from "react";
import { ScrollView } from "react-native";
import TruckCard from "./TruckCard";

const TruckList = ({ truckData, searchQuery }) => {
  return (    
      <ScrollView>
        {truckData.map((truck, index) => (
          <TruckCard
            key={index}
            title={truck.title}
            fromLocation={truck.fromLocation}
            toLocation={truck.toLocation}
            labels={truck.labels}
            description={truck.description}
            onButton1Press={truck.onButton1Press}
            onButton2Press={truck.onButton2Press}
            searchQuery={searchQuery}
          />
        ))}
      </ScrollView>    
  );
};



export default TruckList;
