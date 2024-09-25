import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';

// Screen to display the recommended itinerary
export default function Screen3Pt5({ route, navigation }) {
    const { roadRoutes, sortedCoordinates } = route.params;

    return (
        <View style={styles.container}>
            <Appbar.Header style={{minWidth: '100%'}}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Trip Itinerary" />
            </Appbar.Header>
            <Text style={styles.title}>Recommended Itinerary:</Text>
            {roadRoutes.map((route, index) => (
                <View key={index} style={styles.routeContainer}>
                    <Text style={styles.routeTitle}>{sortedCoordinates[index].name} to {sortedCoordinates[index + 1]?.name}</Text>
                    <Text>Estimated Travel Time: {route.travelTime}</Text>
                </View>
            ))}
            <Text style={styles.footer}>Remember, you can take breaks during your journey. You can also add any additional stops to update your itinerary if you want to.</Text>
            <Text style={styles.footer}>Enjoy your trip!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        paddingLeft: 10,
        paddingTop: 10,
    },
    routeContainer: {
        marginBottom: 15,
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#ccc',
    },
    routeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 20,
        fontSize: 16,
        fontStyle: 'italic',
        paddingHorizontal: 10,
    },
});