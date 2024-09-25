import React, { useState, useEffect } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { View, StyleSheet, Button, Text } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import { Appbar } from 'react-native-paper';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import { GOOGLE_MAPS_API_KEY } from '@env';

// This screen will display the map with the selected locations and the routes between them
export default function Screen3Pt4({ route, navigation }) {
    const { location, time, selectedLocations, comingFromData } = route.params;
    const [coordinates, setCoordinates] = useState([]);
    const [startCoordinate, setStartCoordinate] = useState(null);
    const [sortedCoordinates, setSortedCoordinates] = useState([]);
    const [roadRoutes, setRoadRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [visibility, setVisibility] = useState(false);
    const [button, setButton] = useState("Add Marker");

    // Fetch the latitude and longitude for the starting point and selected locations
    useEffect(() => {
        const fetchCoordinates = async () => {
            console.log("Part 1");
            try{
                if (comingFromData === null) {   
                    let { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        return;
                    }
                }

                let startLocation = comingFromData !== null ? comingFromData : await Location.getCurrentPositionAsync({});
                console.log("Start Location:", startLocation);
                const startCoord = {
                    name: "Starting Point",
                    distance: 0,
                    latitude: comingFromData !== null ? startLocation.latitude : startLocation.coords.latitude,
                    longitude: comingFromData !== null ? startLocation.longitude : startLocation.coords.longitude,
                };
                setStartCoordinate(startCoord);

                console.log("Part 2");
                // Fetch coordinates for selected locations
                const coords = await Promise.all(
                    selectedLocations.map(loc =>
                        {
                            // Set the coordinates of the selected locations
                            if(typeof loc.latlng === 'string'){
                                var latlng = loc.latlng.split(',');
                                return {
                                    name: loc.name,
                                    latitude: parseFloat(latlng[0]),
                                    longitude: parseFloat(latlng[1]),
                                };
                            } else if (Array.isArray(loc.latlng)){
                                return {
                                    name: loc.name,
                                    latitude: loc.latlng[0],
                                    longitude: loc.latlng[1],
                                };
                            } else if (typeof loc.latlng === 'object'){
                                return {
                                    name: loc.name,
                                    latitude: loc.latlng.latitude,
                                    longitude: loc.latlng.longitude,
                                };
                            } else {
                                return {
                                    name: loc.name,
                                    latitude: loc.latitude,
                                    longitude: loc.longitude,
                                };
                            }
                        }
                    )
                );
                // Sort locations based on distance from the start
                const sortedCoords = [startCoord, ...sortLocationsByDistance(startCoord, coords)];
                setSortedCoordinates(sortedCoords);

                // Fetch the road route using Google Maps Directions API
                const roadRoutes = await Promise.all(
                    sortedCoords.map(async (location, index) => {
                        if (index < sortedCoords.length - 1) {
                            const nextLocation = sortedCoords[index + 1];
                            return await getDirections(location, nextLocation);
                        }
                        return null;
                    })
                );

                console.log("Is roadRoutes an array? " + Array.isArray(roadRoutes));

                setRoadRoutes(roadRoutes.filter(Boolean));

            } catch (error) {
                console.log(error);
            }

        };

        fetchCoordinates();
    }, [selectedLocations, comingFromData]);

    const getDirections = async (origin, destination) => {
        try {
            const API_KEY = GOOGLE_MAPS_API_KEY;
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${API_KEY}`
            );
    
            if (response.data.routes && response.data.routes.length > 0) {
                const points = decodePolyline(response.data.routes[0].overview_polyline.points);
                const travelTime = response.data.routes[0].legs[0].duration.text; // Get travel time
    
                return { points, travelTime }; // Return both points and travel time
            } else {
                console.error("Invalid or empty routes returned from API", response.data);
                return { points: [], travelTime: "N/A" };
            }
        } catch (error) {
            console.error("Error fetching directions:", error);
            return { points: [], travelTime: "N/A" };
        }
    };

    const addMarker = async (location) => {
        const updatedCoordinates = [...sortedCoordinates, location];
        const updatedSortedCoordinates = sortLocationsByDistance(startCoordinate, updatedCoordinates);
        setSortedCoordinates(updatedSortedCoordinates);
    
        if (updatedSortedCoordinates.length < 2) {
            setRoadRoutes([]);
            return;
        }

        try {
            // Get routes for new coordinates
            const updatedRoadRoutes = await Promise.all(
                updatedSortedCoordinates.map(async (location, index) => {
                    if (index < updatedSortedCoordinates.length - 1) {
                        const nextLocation = updatedSortedCoordinates[index + 1];
                        const route = await getDirections(location, nextLocation);
                        return route;
                    }
                    return null;
                })
            );
    
            // Update routes and filter out null values
            setRoadRoutes(updatedRoadRoutes.filter(Boolean));
        } catch (error) {
            console.log(error);
        }
    };
    
    const removeMarker = async (indexToRemove) => {
        const updatedCoordinates = sortedCoordinates.filter((_, index) => index !== indexToRemove);
        const updatedSortedCoordinates = sortLocationsByDistance(startCoordinate, updatedCoordinates);
        setSortedCoordinates(updatedSortedCoordinates);
    
        if (updatedSortedCoordinates.length < 2) {
            setRoadRoutes([]);
            return; 
        }

        try {
            // Get routes for new coordinates
            const updatedRoadRoutes = await Promise.all(
                updatedSortedCoordinates.map(async (location, index) => {
                    if (index < updatedSortedCoordinates.length - 1) {
                        const nextLocation = updatedSortedCoordinates[index + 1];
                        const route = await getDirections(location, nextLocation);
                        return route;
                    }
                    return null;
                })
            );
    
            // Update routes and filter out null values
            setRoadRoutes(updatedRoadRoutes.filter(Boolean));
        } catch (error) {
            console.log(error);
        }
    };
    

    // Decode the polyline
    const decodePolyline = (encoded) => {
        let points = [];
        let index = 0, len = encoded.length;
        let lat = 0, lng = 0;

        while (index < len) {
            let b, shift = 0, result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
            lng += dlng;

            points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
        }

        return points;
    };

    

    // Calculate distance between two points
    const calculateDistance = (coord1, coord2) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; 
        const dLat = toRad(coord2.latitude - coord1.latitude);
        const dLon = toRad(coord2.longitude - coord1.longitude);
        const lat1 = toRad(coord1.latitude);
        const lat2 = toRad(coord2.latitude);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    // Sort locations by order of distance from the starting point
    const sortLocationsByDistance = (startCoord, locations) => {
        const locationsWithDistance = locations.map(loc => ({
            ...loc,
            distance: calculateDistance(startCoord, loc),
        }));

        locationsWithDistance.sort((a, b) => a.distance - b.distance);

        const middle = locationsWithDistance.pop();
        const reordered = [
            locationsWithDistance[0],
            ...locationsWithDistance.slice(1),
            middle
        ];

        return reordered;
    };

    const saveMapData = async (coordinates, routes, steps) => {
        try {
            const response = await axios.post(`http://192.168.1.133:3000/api/save`, {
                startingLocation: {
                    latitude: startCoordinate.latitude,
                    longitude: startCoordinate.longitude,
                    name: startCoordinate.name,
                },
                selectedLocations: coordinates.map(loc => ({
                    name: loc.name,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                })),
                roadRoutes: routes.map(route => ({
                    travelTime: route.travelTime,
                    points: route.points.map(point => ({
                        latitude: point.latitude,
                        longitude: point.longitude,
                    })),
                })),
            });

            console.log(response.data.result);

            alert('Trip saved successfully!');
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={{minWidth: '100%'}}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Trip Map" />
            </Appbar.Header>

            {
                visibility && (
                    <GooglePlacesAutocomplete
                        placeholder="Enter your location"
                        fetchDetails={true}
                        onPress={(data, details = null) => {
                            setVisibility(false);
                            setButton(visibility ? "Add Marker" : "Cancel Adding Marker");
                            addMarker({ name: details.name, latitude: details.geometry.location.lat, longitude: details.geometry.location.lng});
                        }}
                        query={{
                            key: GOOGLE_MAPS_API_KEY,
                            language: 'en',
                        }}
                        styles={{
                            container: { width: '100%', padding: 10, zIndex: 1, flex:0.8 },
                            textInput: { borderWidth: 1, borderRadius: 5 },
                        }}
                        visible={false}
                    />
                )
            }

            {/* Display the map */}
            {startCoordinate && sortedCoordinates.length > 0 ? (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: startCoordinate.latitude,
                        longitude: startCoordinate.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    showsUserLocation={true}
                >

                    {/* Display all the markers of the locations for the trip */}
                    {sortedCoordinates.length > 0 && sortedCoordinates.map((coord, index) => (
                        <Marker
                            key={index}
                            coordinate={{ latitude: coord.latitude, longitude: coord.longitude }}
                            title={`Location ${index}: ${coord.name}`}
                            description="Tap here to remove"
                            //draggable
                            onCalloutPress={() => removeMarker(index)}
                        />
                    ))}

                    {/* Display the marker starting location */}
                    <Marker
                        coordinate={startCoordinate}
                        title="Starting Point"
                        pinColor="blue"
                    />

                    {/* Display the road routes */}
                    {roadRoutes.map((route, index) => (
                        <React.Fragment key={index}>
                            <Polyline
                                coordinates={route.points}
                                strokeColor="blue"
                                strokeWidth={3}
                                onPress={() => setSelectedRoute({ index, travelTime: route.travelTime })}
                            />
                        </React.Fragment>
                    ))}

                    {selectedRoute && roadRoutes[selectedRoute.index] && (
                        <Marker
                            coordinate={{
                                latitude: (roadRoutes[selectedRoute.index].points[0].latitude + roadRoutes[selectedRoute.index].points[roadRoutes[selectedRoute.index].points.length - 1].latitude) / 2,
                                longitude: (roadRoutes[selectedRoute.index].points[0].longitude + roadRoutes[selectedRoute.index].points[roadRoutes[selectedRoute.index].points.length - 1].longitude) / 2,
                            }}
                        >
                            <View style={styles.timeContainer}>
                                <Text style={styles.timeText}>Time between location {selectedRoute.index} and {selectedRoute.index + 1}: {selectedRoute.travelTime}</Text>
                            </View>
                        </Marker>
                    )}
                </MapView>
            ) : (
                <View>
                    <View style={{ padding: 10 }} />
                    <Text>Loading map...</Text>
                </View>
            )}
            <Button
                title={button}
                onPress={() => {
                    setVisibility(!visibility);
                    setButton(visibility ? "Add Marker" : "Cancel Adding Marker");
                }}
            />
            <Button
                title="View Itinerary"
                onPress={() => navigation.navigate("Screen3Pt5", { roadRoutes, sortedCoordinates })}
            />
            <Button
                title="Save Map Data"
                onPress={() => {
                    saveMapData(sortedCoordinates, roadRoutes, roadRoutes.flatMap(route => route.steps));
                }}
            />
            <Button
                title="Go back home"
                onPress={() => navigation.navigate("Home")}
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
    map: {
        width: '100%',
        height: '50%',
    },
    timeContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: 5,
        borderRadius: 5,
    },
    timeText: {
        fontSize: 14,
        color: 'black',
    },
});
