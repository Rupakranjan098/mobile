import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InvoicesScreen from '../screens/InvoicesScreen';
import CreateInvoiceScreen from '../screens/CreateInvoiceScreen';

const Stack = createNativeStackNavigator();

const InvoiceNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InvoicesList" component={InvoicesScreen} />
      <Stack.Screen name="CreateInvoice" component={CreateInvoiceScreen} />
    </Stack.Navigator>
  );
};

export default InvoiceNavigator;
