import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, FileText, Package, BarChart2, MoreHorizontal, MessageSquare } from 'lucide-react-native';
import { COLORS } from '../styles/theme';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

import { Platform, StyleSheet, View } from 'react-native';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import InvoiceNavigator from './InvoiceNavigator';
import ProductsScreen from '../screens/ProductsScreen';
import AIChatScreen from '../screens/AIChatScreen';
import SettingsScreen from '../screens/SettingsScreen';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const TabNavigator = ({ onLogout }) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : verticalScale(10);
  const barHeight = verticalScale(65) + (insets.bottom > 0 ? insets.bottom : verticalScale(10));

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;
          if (route.name === 'Dashboard') IconComponent = Home;
          else if (route.name === 'Invoices') IconComponent = FileText;
          else if (route.name === 'Products') IconComponent = Package;
          else if (route.name === 'AI Chat') IconComponent = MessageSquare;
          else if (route.name === 'More') IconComponent = MoreHorizontal;

          return (
            <View style={focused ? styles.iconActiveBg : null}>
              <IconComponent 
                size={focused ? 24 : 22} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2} 
              />
            </View>
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: barHeight,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          paddingBottom: bottomPadding,
          paddingTop: verticalScale(12),
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: moderateScale(11),
          fontWeight: '800',
          marginTop: verticalScale(2),
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Invoices" component={InvoiceNavigator} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="AI Chat" component={AIChatScreen} />
      <Tab.Screen name="More">
        {(props) => <SettingsScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconActiveBg: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  }
});

export default TabNavigator;
