import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text, FlatList } from 'react-native';
import CheckBox from 'expo-checkbox';
import axios from 'axios';
import { Appbar } from 'react-native-paper';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import { GOOGLE_MAPS_API_KEY } from '@env';

// In this screen, the user will be able to select locations that they would like to visit
export default function Screen3Pt3({ route, navigation }) {

    const { location, time, locationResponses } = route.params;
    const [locations, setLocations] = useState(locationResponses || []);
    const [visibility, setVisibility] = useState(false);
    const [addText, setAddText] = useState('Add Stop');

    const [selectedLocations, setSelectedLocations] = useState(locationResponses || []);

    console.log("Loading locations: " + locations);
    console.log(Array.isArray(locations));
    console.log(typeof locations);

    // Handle the user's selection of locations
    const handleLocationSelect = (place) => {
        if (selectedLocations.includes(place)) {
            setSelectedLocations(selectedLocations.filter(loc => loc !== place));
        } else {
            setSelectedLocations([...selectedLocations, place]);
        }
    }

    // Submit the user's selected locations to the next screen
    const submitSelections = () => {
        console.log("Locations: " + locations);
        console.log("Selected Locations: " + selectedLocations);
        navigation.navigate('Screen3Pt2', { location, time, selectedLocations });
    }

    // Add a location to the list of locations
    const addLocation = (location) => {
        setLocations([...locations, location]);
    }

    return (
        <View style={styles.container}>
            <Appbar.Header style={{minWidth: '100%'}}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Recommended Locations" />
            </Appbar.Header>
            <View style={{padding: 10}} />
            <Text>Here are some recommended locations for you to visit. Select which ones you would like to go to:</Text>
            <View style={{padding: 10}} />
            {/* Display the GooglePlacesAutocomplete if needed */}
            {
                visibility && (
                    <GooglePlacesAutocomplete
                        placeholder="Enter your location"
                        fetchDetails={true}
                        onPress={(data, details) => {
                        const { lat, lng } = details.geometry.location;
                        setVisibility(false);
                        setAddText('Add Stop');
                        addLocation({
                            id: data.place_id,
                            name: details.name,
                            place_id: data.place_id,
                            address: details.formatted_address,
                            latlng: [lat, lng]
                        });
                        }}
                        query={{
                            key: GOOGLE_MAPS_API_KEY,
                            language: 'en',
                        }}
                        styles={{
                            container: { width: '100%', padding: 10, zIndex: 1, flex:0.3 },
                            textInput: { borderWidth: 1, borderRadius: 5 },
                        }}
                    />
                )
            }
            {/* Display the recommended locations */}
            <View style={styles.listContainer}>
                {locations.map((item) => (
                    <View key={item.id ? item.id.toString() : item.name} style={styles.itemContainer}>
                        <Text>{item.name}</Text>
                        <CheckBox
                            value={selectedLocations.includes(item)}
                            onValueChange={() => handleLocationSelect(item)}
                        />
                    </View>
                ))}
            </View>
            <Button
                title={addText}
                onPress={() => {
                    setAddText(addText === 'Add Stop' ? 'Cancel' : 'Add Stop');
                    setVisibility(!visibility);
                }}
            />
            <Button
                title="Next"
                onPress={() => submitSelections()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    listContainer: {
        width: '90%',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        padding: 10,
    },
});
