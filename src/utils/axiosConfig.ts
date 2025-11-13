// Optimized Axios configuration with request/response interceptors
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { apiCache } from './apiCache';

// Create optimized axios instance for Node.js backend
const nodeApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  withCredentials: true,
  timeout: 20000, // 20 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
  },
});

// Request interceptor - Add cache headers and optimize requests
nodeApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add timestamp to prevent browser caching for POST requests
    if (config.method?.toLowerCase() === 'post') {
      config.headers = config.headers || {};
      config.headers['Cache-Control'] = 'no-cache';
    }
    
    // Check cache for GET requests
    if (config.method?.toLowerCase() === 'get' && config.url) {
      const cacheKey = `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        return Promise.reject({
          __cached: true,
          data: cached,
          config,
        });
      }
      
      (config as any).__cacheKey = cacheKey;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Cache responses and add performance headers
nodeApi.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as any;
    const cacheKey = config.__cacheKey;
    
    // Cache GET responses for 1 minute
    if (cacheKey && response.status === 200 && response.config.method?.toLowerCase() === 'get') {
      apiCache.set(cacheKey, response.data, 60 * 1000);
    }
    
    return response;
  },
  (error) => {
    // Handle cached responses
    if (error.__cached) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK (Cached)',
        headers: {},
        config: error.config,
      });
    }
    
    return Promise.reject(error);
  }
);

export default nodeApi;

