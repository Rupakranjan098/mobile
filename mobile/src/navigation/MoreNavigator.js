import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/SettingsScreen';
import BusinessProfileScreen from '../screens/BusinessProfileScreen';
import PlansScreen from '../screens/PlansScreen';
import SupportCenterScreen from '../screens/SupportCenterScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

const MoreNavigator = ({ onLogout }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsHome">
        {(props) => <SettingsScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
      <Stack.Screen name="Plans" component={PlansScreen} />
      <Stack.Screen name="SupportCenter" component={SupportCenterScreen} />
      <Stack.Screen name="ContactUs" component={ContactUsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

export default MoreNavigator;
