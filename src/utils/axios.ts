import axios from 'axios';

// Prefer explicit API base URL via env; fallback to relative (dev proxy)
const apiBaseUrl =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && (process as any).env?.REACT_APP_API_BASE_URL) ||
  '/';

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;