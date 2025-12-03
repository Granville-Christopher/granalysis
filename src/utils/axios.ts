import axios from 'axios';

// Prefer explicit API base URL via env; fallback to relative (dev proxy)
// API is now versioned at /api/v1
const apiBaseUrl =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && (process as any).env?.REACT_APP_API_BASE_URL) ||
  '/api/v1';

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// Attach CSRF token from cookie to headers automatically
api.interceptors.request.use(async (config) => {
  // Block /auth/me calls for admin routes - check both current pathname and referer
  // This MUST run BEFORE any other logic to prevent the request from going out
  if (typeof window !== 'undefined' && config.url?.includes('/auth/me')) {
    const currentPath = window.location.pathname;
    const referer = document.referrer;
    const href = window.location.href;
    
    // Block if current path is admin, href contains admin, or if referer suggests we're navigating to admin
    const isAdminRoute = currentPath.startsWith('/admin') || href.includes('/admin');
    const isAdminReferer = referer && (referer.includes('/admin') || referer.includes('/admin/login'));
    
    if (isAdminRoute || isAdminReferer) {
      // Cancel the request for admin routes - use a proper Error object
      const cancelledError: any = new Error('Request cancelled for admin route');
      cancelledError.__cancelled = true;
      cancelledError.config = config;
      cancelledError.isAxiosError = false;
      cancelledError.message = 'Request cancelled for admin route';
      console.log('[Axios Interceptor] BLOCKED /auth/me request for admin route', { 
        currentPath, 
        referer, 
        href,
        url: config.url,
        isAdminRoute,
        isAdminReferer
      });
      // Return a rejected promise that axios will treat as a cancellation
      // The response interceptor will convert this to a successful response
      return Promise.reject(cancelledError);
    }
  }

  // Only attach for non-GET requests
  const method = (config.method || 'get').toLowerCase();
  try {
    if (typeof document !== 'undefined' && method !== 'get') {
      const cookie = document.cookie || '';
      let token = '';
      const match = cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('csrfToken='));
      if (!match) {
        // Seed token via dedicated endpoint (avoid axios to skip interceptor loop)
        // Use versioned API endpoint
        await fetch('/api/v1/auth/csrf', { credentials: 'include' });
        const after = document.cookie || '';
        const m2 = after.split(';').map((c) => c.trim()).find((c) => c.startsWith('csrfToken='));
        if (m2) token = decodeURIComponent(m2.split('=').slice(1).join('='));
      } else {
        token = decodeURIComponent(match.split('=').slice(1).join('='));
      }
      if (token) {
        (config.headers as any)['X-CSRF-Token'] = token;
      }
    }
  } catch {
    // ignore
  }
  return config;
});

// Response interceptor to handle email verification errors and suppress 401s for admin routes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ignore cancelled requests for admin routes - don't log or process them
    if (error.__cancelled) {
      // Return a resolved promise with empty data to prevent error propagation
      return Promise.resolve({ data: null, status: 200, statusText: 'OK', headers: {}, config: error.config });
    }

    // Don't suppress 401 errors - let them through so we can handle them properly
    // The admin dashboard will handle redirects if needed

    // Check if error is due to email not being verified
    if (
      error.response?.status === 403 &&
      (error.response?.data?.code === 'EMAIL_NOT_VERIFIED' ||
       error.response?.data?.requiresVerification === true ||
       error.response?.data?.message?.includes('Email verification required'))
    ) {
      // Store the current path to redirect back after verification
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingVerificationRedirect', window.location.pathname);
        // Redirect to a verification page or show modal
        window.location.href = '/verify-email';
      }
    }
    return Promise.reject(error);
  }
);

export default api;