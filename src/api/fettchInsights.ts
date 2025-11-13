// src/api/fetchInsights.ts
import { apiCache } from '../utils/apiCache';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchInsights(fileId: number, useCache: boolean = true) {
  const cacheKey = `insights:${fileId}`;
  
  // Check cache first
  if (useCache) {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    const res = await fetch(`http://localhost:8000/data/${fileId}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      credentials: 'include',
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      }
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(errorData.detail?.message || errorData.message || `Failed to fetch insights: ${res.statusText}`);
      (error as any).response = { status: res.status, data: errorData };
      throw error;
    }
    
    const data = await res.json();
    
    // Cache the response
    if (useCache) {
      apiCache.set(cacheKey, data, CACHE_TTL);
    }
    
    return data;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error("Request timeout. Please try again.");
    }
    console.error("Error fetching insights:", err);
    throw err;
  }
}
