import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { NavigationContainer } from "@react-navigation/native";
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import MapCreator from "./src/utils/MapCreator";
import MapNamer from "./src/utils/MapNamer";
import Tracker from "./src/utils/Tracker";

const Stack = createNativeStackNavigator();

export default App = () => {
  return (
    <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen
        name="Tracker"
        component={Tracker}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MapNamer"
        component={MapNamer}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MapCreator"
        component={MapCreator}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  </NavigationContainer>
  );
}  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})