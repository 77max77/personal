import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from './ProfileScreen';
import MainScreen from './MainScreen'
import TabBarIcon from '../components/TabBarIcon'
const Tab = createBottomTabNavigator();

const TabScreen = () => {
  return (
          <Tab.Navigator 
          screenOptions={({route})=>({
            tabBarLabel:route.name,
            tabBarIcon:({focused})=>(
              TabBarIcon(focused,route.name)
            )
          })}
        >
          <Tab.Screen name="Main" component={MainScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
  );
}

export default TabScreen;