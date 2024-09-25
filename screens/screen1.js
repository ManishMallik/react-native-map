//Ignore this screen, it was only for my testing purposes with React Native Maps

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Appbar } from 'react-native-paper';

import {GOOGLE_MAPS_API_KEY} from '@env';

export default function Screen1({navigation}) {
  const [location, setLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);

  // Fetch current location on app load
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  // Add a marker to the map
  const addMarker = (location) => {
    setMarkers([...markers, location]);

    // If there are two markers, calculate the route
    if (markers.length === 1) {
      getDirections(markers[0], location);
    }
  };

  // Remove a marker from the map
  const removeMarker = (index) => {
    setMarkers(markers.filter((_, i) => i !== index));
    setRouteCoords([]); // Remove route when a marker is deleted
  };

  // Get directions from Google Maps Directions API
  const getDirections = async (startLoc, destinationLoc) => {
    const start = `${startLoc.latitude},${startLoc.longitude}`;
    const destination = `${destinationLoc.latitude},${destinationLoc.longitude}`;

    // get API key from env file
    const apiKey = GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start}&destination=${destination}&key=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes.length) {
        const points = decode(data.routes[0].overview_polyline.points);
        setRouteCoords(points.map(point => ({ latitude: point[0], longitude: point[1] })));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Decode the polyline points from Directions API response
  const decode = (t, e) => {
    let points = [];
    let index = 0, len = t.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;

      points.push([lat * 1e-5, lng * 1e-5]);
    }
    return points;
  };

  return (
    <View style={styles.container}>
      {/* Add a back arrow on the header  */}
        <Appbar.Header style={{minWidth: '100%'}}>
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content title="Map" />
            {/* Appbar is currently not covering whole screen width, do that */}
        </Appbar.Header>
      {/* Google Places Autocomplete */}
      <GooglePlacesAutocomplete
        placeholder="Search for places (Screen 1)"
        fetchDetails={true}
        onPress={(data, details = null) => {
          const { lat, lng } = details.geometry.location;
          addMarker({ latitude: lat, longitude: lng });
        }}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'en',
        }}
        styles={{
          container: { width: '100%', padding: 10, zIndex: 1 },
          //Add a borderline
          textInput: { borderWidth: 1, borderRadius: 5 },
        }}
      />

      {/* MapView */}
        {location && (
            <MapView
            style={styles.map}
            initialRegion={location}
            showsUserLocation={true}
            >
            {markers.map((marker, index) => (
                <Marker
                key={index}
                coordinate={marker}
                draggable
                onCalloutPress={() => removeMarker(index)}
                />
            ))}

            {/* Draw route as polyline */}
            {routeCoords.length > 0 && (
                <Polyline
                coordinates={routeCoords}
                strokeWidth={5}
                strokeColor="blue"
                />
            )}
            </MapView>
        )}

      {/* Clear markers button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Clear Markers"
          onPress={() => {
            setMarkers([]);
            setRouteCoords([]);
          }}
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
  map: {
    width: '100%',
    height: '60%',
    flex: 10,
  },
  buttonContainer: {
    flex: 3,
  },
});