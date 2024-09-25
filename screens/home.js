import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import axios from 'axios';
import { Appbar } from 'react-native-paper';

// This is the home screen of the app
export default function Home({ navigation }) {

    return (
        <View style={styles.container}>
        <Appbar.Header style={{minWidth: '100%'}}>
            <Appbar.Content title="Home" />
        </Appbar.Header>
        <View style={{padding: 10}} />
        <Text style={{fontSize: 25, fontWeight: 'bold', padding: 10}}>Welcome to my Trip Planner App!</Text>
        <View style={{padding: 30}} />
        {/* Buttons for screen 1 and screen 2 were for just experimenting with expo maps */}
        {/* <Button
            title="Go to Screen 1"
            onPress={() => navigation.navigate('Screen1')}
        />
        <Button
            title="Go to Screen 2"
            onPress={() => navigation.navigate('Screen2')}
        /> */}
        <Button
            title="Finding places to go on a trip"
            onPress={() => navigation.navigate('Screen3Pt1')}
        />
        <Button
            title="Load planned trips"
            onPress={() => navigation.navigate('Screen4Pt1')}
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
});