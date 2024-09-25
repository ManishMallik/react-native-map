import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Appbar } from 'react-native-paper';

// Screen to load planned trips
export default function Screen4Pt1({ navigation }) {

    const [trips, setTrips] = useState([]);

    useEffect(() => {
        axios.get('http://192.168.1.133:3000/api/data')
            .then(res => {
                setTrips(res.data);
            })
            .catch(err => {
                console.log(err);
            });
    }, []);

    const deleteTrip = (index) => {
        Alert.alert(
            "Delete Trip",
            "Are you sure you want to delete this trip?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            await axios.delete(`http://192.168.1.133:3000/api/deleteTrip/${index}`);
                            
                            const updatedTrips = trips.filter((_, tripIndex) => tripIndex !== index);
                            setTrips(updatedTrips);
                        } catch (error) {
                            console.log(error);
                            alert("Failed to delete the trip.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ minWidth: '100%' }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Load planned trips" />
            </Appbar.Header>
            <View style={{ padding: 10 }} />
            <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Select a trip to load or delete</Text>
            <View style={{ padding: 30 }} />
            
            {/* Display the saved trips */}
            {trips.map((trip, index) => (
                <View key={index} style={styles.tripContainer}>
                    <TouchableOpacity
                        style={styles.loadTripButton}
                        onPress={() => navigation.navigate('Screen3Pt4', {
                            location: trip.location,
                            time: trip.time,
                            selectedLocations: trip.selectedLocations,
                            comingFromData: trip.startingLocation,
                        })}
                    >
                        <Text style={styles.buttonText}>{"Trip " + (index + 1)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteTrip(index)}
                    >
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    tripContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
        marginVertical: 10,
    },
    loadTripButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 10,
    },
    deleteButton: {
        backgroundColor: '#F44336',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    }
});


