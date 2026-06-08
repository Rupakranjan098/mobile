import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ─── API Configuration ────────────────────────────────────────────────────────
// XAMPP Apache serves on port 80. Laravel public folder is at:
// http://172.20.10.3/ProGst/backend/public
//
// To use php artisan serve instead, run:
//   php artisan serve --host=172.20.10.3 --port=8001
// and revert PORT back to '8001' and BASE_PATH to ''

const getHostname = () => {
  // If we are in development, try to get the dev machine IP dynamically from Expo packager
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost || Constants.manifest?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip) return ip;
    }
    // Fallback for emulator/simulator if hostUri is not available
    return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  }
  // Hardcoded fallback for production
  return '172.20.10.3';
};

export const HOSTNAME = getHostname();
export const PORT = '80';           // XAMPP Apache port
export const BASE_PATH = '/ProGst/backend/public'; // path under htdocs

export const getBaseUrl = () => {
  const port = PORT === '80' ? '' : `:${PORT}`;
  return `http://${HOSTNAME}${port}${BASE_PATH}/api`;
};

export const API_BASE_URL = getBaseUrl();
export const SERVER_URL = `http://${HOSTNAME}${PORT === '80' ? '' : `:${PORT}`}${BASE_PATH}`;
