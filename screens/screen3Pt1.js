import React, {useState} from 'react';
import { View, StyleSheet, Button, Text, TextInput } from 'react-native';
import axios from 'axios';
import { Appbar } from 'react-native-paper';

// In this screen, there will be a text input field for the user to enter where they would like to go to
export default function Screen3Pt1({ navigation }) {

    const [text, setText] = useState('');
    const [days, setDays] = useState(1);

    async function submit() {

        if(text === '') {
            alert("Please enter a location");
            return;
        }

        try {
            const response = await axios.get(`http://192.168.1.133:3000/api/location`, {
                params: {
                    location: text,
                    time: days
                }
            });

            console.log(response.data.result);
            
            navigation.navigate('Screen3Pt3', { 
                location: text,
                time: days, 
                locationResponses: response.data.result,
            });
        } catch (error) {
            console.log(error);
            alert("An error occurred. Please try again.");
        }
    }

    return (
        <View style={styles.container}>
            <Appbar.Header style={{
                minWidth: '100%',
                absolute: 'top',
            }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Trip Planning" />
            </Appbar.Header>
            <View style={{padding: 10}} />
            <Text style={{fontSize: 25, fontWeight: 'bold'}}>Trip Planning Assistant!</Text>
            <View style={{padding: 10}} />
            <Text style={{padding: 10}}>Hello fellow traveler! We are excited that you will be planning a trip, and we would love to help you out!</Text>
            <View style={{padding: 10}} />
            <Text>Where would you like to go?</Text>
            <View style={{padding: 10}} />
            <TextInput
                placeholder="Enter the location you want to go to."
                onChangeText={(text) => setText(text)}
                style={styles.textInput}
                multiline={true}
            />
            <View style={{padding: 10}} />
            <Text>Number of days you plan to be on your trip: {days}</Text>
            <View style={{flexDirection: 'row'}}>
                <Button
                    title="Increase"
                    onPress={() => setDays(days + 1)}
                />
                <Button
                    title="Decrease"
                    onPress={() => setDays(days > 1 ? days - 1 : 1)}
                />
            </View>
            <View style={{padding: 10}} />
            <Button
                title="Submit"
                onPress={() => submit()}
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
    textInput: { 
        borderWidth: 1, 
        borderRadius: 5,
        width: '70%',
        padding: 10,
        height: 70,
    },
});