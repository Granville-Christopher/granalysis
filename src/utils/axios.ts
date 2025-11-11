import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/',  // Use relative path since we have the proxy
  withCredentials: true,  // Always send credentials
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;