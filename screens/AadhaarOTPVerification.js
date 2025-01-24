import { View, StyleSheet } from 'react-native';
import React, { useContext } from 'react';
import { COLORS } from '../constants/index.js';
import { OtpInput } from 'react-native-otp-entry';
import { LoadNeedsContext } from '../hooks/LoadNeedsContext.js';


const AadhaarOTPVerification = () => {

    const {
        setAadhaarOTP
          } = useContext(LoadNeedsContext)

    

    return (
        <View>
            <OtpInput
                numberOfDigits={6}
                onTextChange={(text) => setAadhaarOTP(text)}
                focusColor={COLORS.primary}
                focusStickBlinkingDuration={400}
                disabled={false}
                theme={{
                    pinCodeContainerStyle: {
                        backgroundColor: COLORS.white,
                        width: 50,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flex: 1,
                        borderRadius: 12,
                        margin: 5,
                        marginVertical: 10,
                    }
                }}
            />

        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btn: {
        backgroundColor: 'brown',
        color: '#fff',
        padding: 12,
        borderRadius: 5,
        textAlign: "center",
        width: "100%"
    },
    buttonContainer: {
        width: 200,
        backgroundColor: COLORS.primary,
        borderRadius: 5,
        marginHorizontal: 5,
        paddingVertical: 15,
        borderWidth: 1,
        alignItems: "center",
        marginTop: 30,

    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
            fontWeight : "bold"
    },
})

export default AadhaarOTPVerification