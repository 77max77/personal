import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabScreen from './Screen/TabScreen';
import ProfileDetailScreen from './Screen/ProfileDetailScreen';
import LoginScreen from './Screen/LoginScreen';
import ProfileScreen from './Screen/ProfileScreen';
const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen options={{ headerShown: false }} name="Login" component={LoginScreen} />
        <Stack.Screen options={{ headerShown: false }} name="Tab" component={TabScreen} />
        <Stack.Screen options={{ headerShown: false }} name="ProfileDetailScreen" component={ProfileDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
