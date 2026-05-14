import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, DeviceEventEmitter } from 'react-native';
import TabNavigator from './src/navigation/TabNavigator';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from './src/styles/theme';
import { logout } from './src/services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    
    // Listen for 401 errors from API
    const subscription = DeviceEventEmitter.addListener('unauthorized', () => {
      handleLogout();
    });

    return () => subscription.remove();
  }, []);

  const checkAuth = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await logout();
      }
    } catch (error) {
      console.log('Logout API error (expected if token is invalid):', error.message);
    } finally {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
      setAuthView('login');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {authView === 'login' ? (
          <LoginScreen 
            onLoginSuccess={handleLoginSuccess} 
            onSwitchToRegister={() => setAuthView('register')} 
          />
        ) : (
          <RegisterScreen 
            onRegisterSuccess={handleLoginSuccess} 
            onSwitchToLogin={() => setAuthView('login')} 
          />
        )}
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <TabNavigator onLogout={handleLogout} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
