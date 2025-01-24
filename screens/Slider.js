import { View, Text, StyleSheet, FlatList, Image } from 'react-native'
import React, {useState} from 'react'
import {COLORS} from '../constants/theme'

const Slider = () => {
    const [slider, setSlider] = useState([
        {
            text:'Slider 1',
            image: {
                url:'https://fastly.picsum.photos/id/1/200/300.jpg?hmac=jH5bDkLr6Tgy3oAg5khKCHeunZMHq0ehBZr6vGifPLY'
            }
        },
        {
            text:'Slider 1',
            image: {
                url:'https://fastly.picsum.photos/id/1/200/300.jpg?hmac=jH5bDkLr6Tgy3oAg5khKCHeunZMHq0ehBZr6vGifPLY'
            }
        }
    ])
  return (
    <View>
      <Text style={styles.heading}>Recent Updates</Text>
      <FlatList
      data={slider}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      renderItem={({item})=> (
        <View style={{marginRight:20}}>
            <Image source={{uri:item?.image?.url}} style={styles.sliderImage}></Image>
        </View>
      ) }
      />
    </View>
  )
}

const styles = StyleSheet.create({
    heading:{
        fontSize:15,
        margin:15,
        color:COLORS.brand,
        fontWeight:'bold'
    },
    sliderImage:{
        width:270,
        height:150,
        borderRadius:20,
        marginStart:10
    }
})

export default Slider