import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from './ProfileScreen';
import MainScreen from './MainScreen'
const Tab = createBottomTabNavigator();

const TabScreen = () => {
  return (
        <Tab.Navigator>
          <Tab.Screen name="Main" component={MainScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
  );
}

export default TabScreen;