import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAppSettings } from '../services/api';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState('dark'); // Default to dark as requested earlier

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        // Try fetching from API if not in local storage
        const res = await getAppSettings();
        if (res.data?.theme) {
          setTheme(res.data.theme);
          await AsyncStorage.setItem('app_theme', res.data.theme);
        }
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const toggleTheme = async (newTheme) => {
    setTheme(newTheme);
    await AsyncStorage.setItem('app_theme', newTheme);
  };

  const isDark = theme === 'dark';

  const themeColors = {
    primary: '#22c55e',
    background: isDark ? '#0f172a' : '#f8fafc',
    card: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.9)',
    text: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    statusBg: isDark ? '#1e293b' : '#f1f5f9',
    glass: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.7)',
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, colors: themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
