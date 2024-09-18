import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';

export default function Home({ navigation }) {
    return (
        <View style={styles.container}>
        <Text>Home Screen</Text>
        <Button
            title="Go to Screen 1"
            onPress={() => navigation.navigate('Screen1')}
        />
        <Button
            title="Go to Screen 2"
            onPress={() => navigation.navigate('Screen2')}
        />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});