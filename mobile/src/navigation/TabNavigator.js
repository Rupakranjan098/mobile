import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, FileText, Package, BarChart2, MoreHorizontal, Wallet, MessageSquare } from 'lucide-react-native';
import { COLORS } from '../styles/theme';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import InvoiceNavigator from './InvoiceNavigator';
import ProductsScreen from '../screens/ProductsScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AIChatScreen from '../screens/AIChatScreen';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const TabNavigator = ({ onLogout }) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom + verticalScale(5) : verticalScale(20);
  const barHeight = verticalScale(60) + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = Home;
          else if (route.name === 'Invoices') iconName = FileText;
          else if (route.name === 'Products') iconName = Package;
          else if (route.name === 'AI Chat') iconName = MessageSquare;
          else if (route.name === 'Reports') iconName = BarChart2;
          else if (route.name === 'More') iconName = MoreHorizontal;

          const IconComponent = iconName || MoreHorizontal;
          return <IconComponent size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          paddingBottom: bottomPadding,
          paddingTop: verticalScale(10),
          height: barHeight,
          backgroundColor: COLORS.card,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: moderateScale(10),
          fontWeight: '700',
          marginBottom: verticalScale(-2),
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

export default TabNavigator;
