import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native';
import { COLORS } from '../constants';

const DeleteConfirmationModal = ({ handleYes, handleCancel }) => {

    return (
        <>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Delete confirmation</Text>

                    <Text style={styles.modalText}>Are you sure want to delete this details?</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleYes}>
                            <Text style={[styles.buttonText, { textAlign: "center" }]}>Yes</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </View>

        </>
    )
}


const styles = StyleSheet.create({
    centeredContainer: {
        flex: 1,
        backgroundColor: "#e8f4ff",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        marginTop: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: COLORS.white,
        padding: 20,
        width: "80%",
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    modalText: {
        fontSize: 15,
        marginTop: 10,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        padding: 12,

    },
    inputError: {
        borderColor: "red",
    },
    applyButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    applyButtonText: {
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
    },
    closeButton: {
        backgroundColor: "#8a1c33",
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    locationModalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        height: "90%"
    },
    locationModalContent: {
        backgroundColor: COLORS.white,
        padding: 20,
        width: "80%",
        borderRadius: 10,
        elevation: 5,
        height: "90%"
    },
    locationContainer: {
        flex: 1,
        padding: 5,
    },
    locationTextInput: {
        borderWidth: 1,
        borderColor: COLORS.gray,
    },
    multiSelectBackdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.01)',
    },
    multiSelectBox: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'grey',
        padding: 10,
        paddingLeft: 15,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12

    },
    selectToggleText: {
        color: '#000',
        fontSize: 14
    },
    selectText: {
        color: 'red'
    },
    selectedItemText: {
        color: COLORS.primary,
    },
    multiSelectChipContainer: {
        borderWidth: 0,
        backgroundColor: '#ddd',
        borderRadius: 8,
    },
    multiSelectChipText: {
        color: '#222',
        fontSize: 12,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
        alignItems: 'center',
        marginHorizontal: 20

    },
    saveButton: {
        backgroundColor: "#0066cc",
        width: "50%",
    },
    cancelButton: {
        backgroundColor: "#999",
        width: "50%",

    },
    button: {
        backgroundColor: "#0066cc",
        borderRadius: 5,
        padding: 10,
        marginHorizontal: 20,
        marginTop: 10,
    },
    buttonText: {
        fontSize: 16,
        color: "#fff",
        textAlign: "center",
    },
});

export default DeleteConfirmationModal