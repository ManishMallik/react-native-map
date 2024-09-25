import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';

// Import the navigation
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// Import the screens
import Home from './screens/home';
import Screen1 from './screens/screen1';
import Screen2 from './screens/screen2';
import Screen3Pt1 from './screens/screen3Pt1';
import Screen3Pt2 from './screens/screen3Pt2';
import Screen3Pt3 from './screens/screen3Pt3';
import Screen3Pt4 from './screens/screen3Pt4';
import Screen3Pt5 from './screens/screen3Pt5';
import Screen4Pt1 from './screens/screen4Pt1';

// Stack Navigator
export default function App() {
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Screen1" component={Screen1} />
        <Stack.Screen name="Screen2" component={Screen2} />
        <Stack.Screen name="Screen3Pt1" component={Screen3Pt1} />
        <Stack.Screen name="Screen3Pt2" component={Screen3Pt2} />
        <Stack.Screen name="Screen3Pt3" component={Screen3Pt3} />
        <Stack.Screen name="Screen3Pt4" component={Screen3Pt4} />
        <Stack.Screen name="Screen3Pt5" component={Screen3Pt5} />
        <Stack.Screen name="Screen4Pt1" component={Screen4Pt1} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '60%',
  },
});
