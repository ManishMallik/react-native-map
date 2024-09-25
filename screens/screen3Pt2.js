import React, {useState} from 'react';
import { View, StyleSheet, Button, Text, TextInput } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import axios from 'axios';
import { Appbar } from 'react-native-paper';
import { GOOGLE_MAPS_API_KEY } from '@env';
import * as Location from 'expo-location';

// In this screen, there will be a text input field for user to enter where they will be coming from
export default function Screen3Pt2({ route, navigation }) {
    
        const { location, time, selectedLocations } = route.params;
        const [text, setText] = useState('');
        const [data, setData] = useState(null);

        // Submit the user's selected starting location and data from the previous screens to the next screen
        async function submit(input) {
            console.log(location + " " + time);
            try {
                if(input !== null) {
                    console.log(data);
                }
                navigation.navigate('Screen3Pt4', { 
                    location, 
                    time, 
                    selectedLocations: selectedLocations,
                    comingFromData: (input === null) ? null : data
                });
            } catch (error) {
                console.log(error);
            }
        }

        return(
            <View style={styles.container}>
                <Appbar.Header style={{minWidth: '100%'}}>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Trip Planning" />
                </Appbar.Header>
                <View style={{padding: 10}} />
                <Text>What will your starting location be?</Text>
                <View style={{padding: 10}} />
                <GooglePlacesAutocomplete
                    placeholder="Enter your location"
                    fetchDetails={true}
                    onPress={(data, details = null) => {
                    setData({
                        description: data.description,
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng
                    });
                    setText(data.description);
                    }}
                    query={{
                        key: GOOGLE_MAPS_API_KEY,
                        language: 'en',
                    }}
                    styles={{
                        container: { width: '100%', padding: 10, zIndex: 1, flex:0.3 },
                        //Add a borderline
                        textInput: { borderWidth: 1, borderRadius: 5 },
                    }}
                />
                <View>
                    <Button
                        title="Submit"
                        onPress={() => submit("")}
                    />
                    <Button
                        title="Use Current Location"
                        onPress={() => submit(null)}
                    />
                </View>
            </View>
        );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    textInput: { 
        borderWidth: 1, 
        borderRadius: 5,
        width: '70%',
        padding: 10, 
    },
});