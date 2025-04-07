import React from "react";
import { StyleSheet, View, ScrollView, Text, Image } from "react-native";
import TruckCard from "../TruckCard";
import { TouchableOpacity } from "react-native";
import { COLORS } from "../../constants";
import { useNavigation } from "@react-navigation/native";
import Constants from 'expo-constants';
import PaginationScreen from "../PaginationScreen";
import Pagination from "../Pagination";
import PaginationComponent from "../PaginationComponent";
import Foundation from '@expo/vector-icons/Foundation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';



const LoadDetails = ({
  isMyPost,
  search,
  setSearch,
  page,
  setPage,
  dataLimit,
  setDataLimit,
  getAllData,
  showingData,
  setShowingData,
  showingDataLoading,
  setShowingDataLoading,
  searchQuery,
  setSearchQuery,
  filteredTrucks,
  status,
  selectedValue,
  handlePagination,
  totalRecords,
  isFiltered,
  applyFilter,
  applyFilterPagination,
  setApplyFilterPagination,
  availableLoadsPage

}) => {



  // cdn link
  const cdnLink = Constants.expoConfig?.extra?.REACT_APP_CDN_LINK


  const navigation = useNavigation()


  return (
    <ScrollView contentContainerStyle={styles.container}>


      {isMyPost === false && showingData.length > 0 ?
        <>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ margin: 10, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Foundation name="results" size={20} color="green" />
              <Text style={{ fontSize: 16, fontWeight: 500 }}>Showing {`${showingData.length}`} of {`${totalRecords}`} </Text>
            </View>
            {/* <View style={{ margin: 10, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={async () => {
                  setApplyFilterPagination(false); // Allow `getAllLoads` to be called again
                  setSearchQuery("")
                  setPage(1)
                  await getAllData("", 1, 10)
                }}>
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
            data1={filteredTrucks} handlePagination={handlePagination} totalRecords={totalRecords}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isFiltered={isFiltered}
            applyFilter={applyFilter}
            applyFilterPagination={applyFilterPagination}
            setApplyFilterPagination={setApplyFilterPagination}
            availableLoadsPage={availableLoadsPage}
          />
        </>

        : (
          null
        )}

      {isMyPost === true &&
          filteredTrucks.length > 0 ? (
            filteredTrucks.map((truck, index) => (
              <View key={index}
              >
                <TruckCard
                  selectedValue={selectedValue}
                  post={truck.post}
                  profileName={truck.profileName}
                  companyName={truck.companyName}
                  transportName={truck.transportName}
                  title={truck.title}
                  fromLocation={truck.fromLocation}
                  toLocation={truck.toLocation}
                  labels={truck.labels}
                  description={truck.description}
                  onButton1Press={truck.onButton1Press} // Ensure handleEdit is invoked correctly
                  onButton2Press={truck.onButton2Press}
                  status={status}
                  updatedTime={truck.updatedTime}
                  isAadhaarVerified={truck.isAadhaarVerified}
                />
    
              </View>
            ))
          ) : (
            <>
              {/* If My Posts empty */}
              {
                selectedValue === "user_load_details" ?
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
                  </View>
                  : null
              }
    
              {
                selectedValue === "user_driver_details" ?
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
                  </View>
                  : null
              }
    
              {
                selectedValue === "user_truck_details" ?
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
                  </View>
                  : null
              }
    
              {
                selectedValue === "user_buy_sell_details" ?
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
                        onPress={() => navigation.navigate('MarketPlace')}
                      > Click here to post a driver</Text>
                    </TouchableOpacity>
                  </View>
                  : null
              }
    
    
              {/* If Four cards empty */}
              {
                !selectedValue && filteredTrucks.length === 0 ?
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
                        onPress={() => navigation.navigate('TruckNeeds')}
                      > Click here to post a truck</Text>
                    </TouchableOpacity>
                  </View>
                  :
                  null
              }
            </>
          )}
      



      {/* {
        filteredTrucks.length > 0 ?
          <PaginationComponent
            search={search}
            setSearch={setSearch}
            page={page}
            setPage={setPage}
            dataLimit={dataLimit}
            setDataLimit={setDataLimit}
            getAllLoads={getAllLoads}
            showingData={showingData}

            setShowingData={setShowingData}
            showingDataLoading={showingDataLoading}
            setShowingDataLoading={setShowingDataLoading}

            data1={filteredTrucks?.reverse()} handlePagination={handlePagination} totalRecords={totalRecords}
          />
          :
          null
      } */}





    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    // flex:1
  },
  noResultContainer: {
    marginTop: 200,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    textAlign: "center",
    marginBottom: 30,
    color: "grey",
    fontSize: 16,
  },
  paginationContainer: {
    backgroundColor: 'red',
    marginHorizontal: 10,
    borderRadius: 5,
    padding: 10
  }
});

export default LoadDetails;
