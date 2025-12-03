// Optimized Axios configuration with request/response interceptors
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { apiCache } from './apiCache';

// Create optimized axios instance for Node.js backend
// API is now versioned at /api/v1
const getBaseURL = () => {
  const envUrl = process.env.REACT_APP_API_URL || '';
  if (envUrl && !envUrl.endsWith('/api/v1')) {
    return envUrl.endsWith('/') ? `${envUrl}api/v1` : `${envUrl}/api/v1`;
  }
  return envUrl || '/api/v1';
};

const nodeApi = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 60000, // 60 second timeout (increased for file uploads)
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
    
    // Check cache for GET requests (but skip caching for dynamic endpoints like /files)
    if (config.method?.toLowerCase() === 'get' && config.url) {
      // Don't cache dynamic endpoints that change frequently
      const noCacheEndpoints = ['/files', '/auth/me', '/ai/usage'];
      const shouldCache = !noCacheEndpoints.some(endpoint => config.url?.startsWith(endpoint));
      
      if (shouldCache) {
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
    
    // Cache GET responses for 1 minute (but skip dynamic endpoints)
    if (cacheKey && response.status === 200 && response.config.method?.toLowerCase() === 'get') {
      const noCacheEndpoints = ['/files', '/auth/me', '/ai/usage'];
      const shouldCache = !noCacheEndpoints.some(endpoint => response.config.url?.startsWith(endpoint));
      if (shouldCache) {
        apiCache.set(cacheKey, response.data, 60 * 1000);
      }
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
