//Ignore this screen

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Appbar } from 'react-native-paper';

import { GOOGLE_MAPS_API_KEY } from '@env';

export default function Screen2({ navigation }) {
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

      // Add this location as the initial marker (user's current location)
      addMarker({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      }, true); // Pass true for the initial marker to prevent route drawing
    })();
  }, []);

  // Add a marker to the map and recalculate routes
  const addMarker = (location, isInitial = false) => {
    const updatedMarkers = [...markers, location];
    setMarkers(updatedMarkers);

    if (!isInitial) {
      recalculateRoutes(updatedMarkers);
    }
  };

  // Remove a marker and recalculate routes
  const removeMarker = (index) => {
    const updatedMarkers = markers.filter((_, i) => i !== index);
    setMarkers(updatedMarkers);
    recalculateRoutes(updatedMarkers);
  };

  // Recalculate routes between all consecutive markers
  const recalculateRoutes = async (updatedMarkers) => {
    const routes = [];

    // Loop through the markers to calculate routes between each consecutive pair
    for (let i = 0; i < updatedMarkers.length - 1; i++) {
      const startLoc = updatedMarkers[i];
      const destinationLoc = updatedMarkers[i + 1];

      const route = await getDirections(startLoc, destinationLoc);
      if (route && route.length > 0) {
        routes.push(...route);
      }
    }

    // Update the route coordinates with the newly calculated routes
    setRouteCoords(routes);
  };

  // Get directions between two locations from Google Maps Directions API
  const getDirections = async (startLoc, destinationLoc) => {
    const start = `${startLoc.latitude},${startLoc.longitude}`;
    const destination = `${destinationLoc.latitude},${destinationLoc.longitude}`;

    const apiKey = GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start}&destination=${destination}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes.length) {
        const points = decode(data.routes[0].overview_polyline.points);
        return points.map(point => ({ latitude: point[0], longitude: point[1] }));
      } else {
        console.warn("No routes found");
        return [];
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
      return [];
    }
  };

  // Decode polyline points from the Directions API response
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
      <Appbar.Header style={{ minWidth: '100%' }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Screen 2" />
      </Appbar.Header>

      {/* Google Places Autocomplete */}
      <GooglePlacesAutocomplete
        placeholder="Search for places (Screen 2)"
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
          container: { width: '100%', padding: 10, zIndex: 1, flex: 1 },
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
              title={`Marker ${index + 1}`}  // Add title
              description="Tap here to remove"
              draggable
              onCalloutPress={() => removeMarker(index)} // Trigger marker removal on callout press
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
    flex: 4,
  },
  buttonContainer: {
    flex: 0.75,
  },
});
