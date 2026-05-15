import { Platform } from 'react-native';

// ─── API Configuration ────────────────────────────────────────────────────────
// XAMPP Apache serves on port 80. Laravel public folder is at:
// http://192.168.1.14/ProGst/backend/public
//
// To use php artisan serve instead, run:
//   php artisan serve --host=192.168.1.14 --port=8001
// and revert PORT back to '8001' and BASE_PATH to ''
export const HOSTNAME = '192.168.1.14';
export const PORT = '80';           // XAMPP Apache port
export const BASE_PATH = '/ProGst/backend/public'; // path under htdocs

export const getBaseUrl = () => {
  const port = PORT === '80' ? '' : `:${PORT}`;
  return `http://${HOSTNAME}${port}${BASE_PATH}/api`;
};

export const API_BASE_URL = getBaseUrl();
export const SERVER_URL = `http://${HOSTNAME}${PORT === '80' ? '' : `:${PORT}`}${BASE_PATH}`;
