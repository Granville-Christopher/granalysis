import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { apiCache } from './apiCache';

const pythonApi = axios.create({
  baseURL: 'http://localhost:8000', 
  withCredentials: true,
  timeout: 300000, // 300s (5 minutes) to allow processing of large datasets
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate, private, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    // Chrome-specific: Add timestamp to prevent caching
    'X-Request-Time': Date.now().toString(),
    // Note: Accept-Encoding is set automatically by the browser, don't set it manually
  },
});

// Request interceptor - Check cache for GET requests and suppress unsafe headers
pythonApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Remove Accept-Encoding if axios tries to set it (browser handles this automatically)
    if (config.headers) {
      delete (config.headers as any)['Accept-Encoding'];
      delete (config.headers as any)['accept-encoding'];
    }
    
    // Always add cache-busting headers to prevent browser caching of error responses
    if (config.headers) {
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
    }
    
    // Only cache GET requests (but not for row-count or warmup endpoints)
    if (config.method?.toLowerCase() === 'get' && config.url && 
        !config.url.includes('/row-count') && !config.url.includes('/warmup')) {
      const cacheKey = `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        // Return cached response as a rejected promise that axios will handle
        return Promise.reject({
          __cached: true,
          data: cached,
          config,
        });
      }
      
      // Store cache key for response interceptor
      (config as any).__cacheKey = cacheKey;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Cache successful GET responses (but not error responses)
pythonApi.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as any;
    const cacheKey = config.__cacheKey;
    
    // Only cache successful GET responses (not row-count or warmup endpoints)
    if (cacheKey && response.status === 200 && 
        !config.url?.includes('/row-count') && !config.url?.includes('/warmup')) {
      apiCache.set(cacheKey, response.data, 5 * 60 * 1000);
    }
    
    return response;
  },
  (error) => {
    // One-time retry on timeout
    const config = error.config as InternalAxiosRequestConfig & { __retryCount?: number };
    const isTimeout =
      error.code === 'ECONNABORTED' ||
      (typeof error.message === 'string' && error.message.toLowerCase().includes('timeout'));

    if (isTimeout && config && (config.__retryCount || 0) < 1) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      // Give the retry a longer window for large datasets
      config.timeout = Math.max(config.timeout ?? 300000, 300000);
      return pythonApi(config);
    }

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

export default pythonApi;