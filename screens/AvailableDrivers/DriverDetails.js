import React from "react";
import { StyleSheet, ScrollView, Text, View, Image } from "react-native";
import TruckCard from "../TruckCard";
import { TouchableOpacity } from "react-native";
import { COLORS } from "../../constants";
import Constants from 'expo-constants';
import PaginationComponent from "../PaginationComponent";
import Foundation from '@expo/vector-icons/Foundation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';



const DriverDetails = ({
  navigation,
  filteredTrucks,
  isMyPost,
  getAllData,
  showingData,
  setShowingData,
  showingDataLoading,
  setShowingDataLoading,
  totalRecords,
  search,
  setSearch,
  page,
  setPage,
  dataLimit,
  setDataLimit,
  searchQuery,
  setSearchQuery,
  isFiltered,
  applyFilter,
  applyFilterPagination,
  setApplyFilterPagination,
  availableDriversPage
}) => {


  // cdn link
  const cdnLink = Constants.expoConfig?.extra?.REACT_APP_CDN_LINK


  return (


    <ScrollView ScrollView contentContainerStyle={styles.container}>

      {isMyPost === false && showingData.length > 0 ?
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ margin: 10, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Foundation name="results" size={20} color="green" />
              <Text style={{ fontSize: 16, fontWeight: 500 }}>Showing {`${showingData.length}`} of {`${totalRecords}`} </Text>
            </View>
            {/* <View style={{ margin: 10, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <TouchableOpacity onPress={async () => await getAllData("", 1, 10)}>
                <MaterialIcons name="replay" size={20} color="black" />
              </TouchableOpacity>
            </View> */}
          </View>

          
          <PaginationComponent
             search={search}
             setSearch={setSearch}
             page={page}
             setPage={setPage}
             dataLimit={dataLimit}
             setDataLimit={setDataLimit}
             getAllData={getAllData}
             showingData={showingData}
             setShowingData={setShowingData}
             showingDataLoading={showingDataLoading}
             setShowingDataLoading={setShowingDataLoading}
             data1={filteredTrucks} 
             totalRecords={totalRecords}
             searchQuery={searchQuery}
             setSearchQuery={setSearchQuery}
             isFiltered={isFiltered}
             applyFilter={applyFilter}
             applyFilterPagination={applyFilterPagination}
             setApplyFilterPagination={setApplyFilterPagination}
             availableDriversPage={availableDriversPage}
          />
        </>

        :
        (
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
                onPress={() => navigation.navigate('DriverNeeds')}
              > Click here to post a driver</Text>
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
    flex: 1
  },
  noResultsText: {
    textAlign: "center",
    marginBottom: 30,
    color: "grey",
    fontSize: 16,
  },
});

export default DriverDetails;
