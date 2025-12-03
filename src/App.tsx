import React, { useEffect, Suspense, lazy, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import api from "./utils/axios";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import MaintenanceModal from "./components/common/MaintenanceModal";

// --- LAZY LOADED PAGES (Code Splitting) ---
const Homepage = lazy(() => import("./pages/home"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const LoginPage = lazy(() => import("./pages/login"));
const LoginWithCode = lazy(() => import("./pages/loginwithcode"));
const SignupPage = lazy(() => import("./pages/signup"));
const ForgotPasswordPage = lazy(() => import("./pages/forgot-password"));
const PricingPage = lazy(() => import("./pages/pricing"));
const PaymentPage = lazy(() => import("./pages/payment"));
const PaymentHistoryPage = lazy(() => import("./pages/payment-history"));
const AccountPage = lazy(() => import("./pages/account"));
const VerifyEmailPage = lazy(() => import("./pages/verify-email"));
const TermsPage = lazy(() => import("./pages/terms"));
const PrivacyPage = lazy(() => import("./pages/privacy"));
const CookiesPage = lazy(() => import("./pages/cookies"));
const HelpPage = lazy(() => import("./pages/help"));
const MonitoringDashboardPage = lazy(() => import("./components/dashboard-components/MonitoringDashboard"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const SuperAdminRegister = lazy(() => import("./pages/admin/SuperAdminRegister"));
const SuperAdminLogin = lazy(() => import("./pages/admin/SuperAdminLogin"));

// Loading component
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    background: 'linear-gradient(135deg, #0B1B3B 0%, #1A345B 50%, #0B1B3B 100%)'
  }}>
    <div style={{ 
      color: '#4FA3FF', 
      fontSize: '18px',
      fontWeight: 'bold'
    }}>Loading...</div>
  </div>
);

// Component to handle catch-all redirect (excludes admin routes)
const CatchAllRedirect: React.FC = () => {
  const location = useLocation();
  
  // Don't redirect admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  
  return <Navigate to="/home" replace />;
};

// Component to check maintenance mode
const MaintenanceChecker: React.FC = () => {
  const location = useLocation();
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkMaintenance = async () => {
      // Skip maintenance check for admin routes
      if (location.pathname.startsWith('/admin')) {
        setMaintenanceMode(false);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/maintenance/status');
        if (response.data?.status === 'success') {
          setMaintenanceMode(response.data.maintenanceMode || false);
          setMaintenanceMessage(response.data.message || '');
        }
      } catch (error) {
        console.error('Failed to check maintenance status:', error);
        setMaintenanceMode(false);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
    // Check every 30 seconds
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  if (loading || !maintenanceMode) {
    return null;
  }

  return <MaintenanceModal message={maintenanceMessage} />;
};

// Component to handle auth checks on route changes
const AuthChecker: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const location = useLocation();
  const skipAuthRef = React.useRef(false);

  useEffect(() => {
    // Get current path once at the start - use window.location.pathname for more reliable check
    // Check IMMEDIATELY and aggressively for admin routes
    const currentPath = window.location.pathname;
    const currentHref = window.location.href;
    const referer = document.referrer;
    
    // Skip auth check entirely for admin routes - they have their own auth (check FIRST)
    // Check multiple sources to be absolutely sure - including referer for navigation
    const isAdminRoute = 
      location.pathname.startsWith('/admin') || 
      currentPath.startsWith('/admin') ||
      currentHref.includes('/admin') ||
      (referer && (referer.includes('/admin') || referer.includes('/admin/login')));
    
    if (isAdminRoute) {
      console.log('[AuthChecker] Skipping auth check for admin route', { 
        locationPath: location.pathname, 
        currentPath, 
        currentHref,
        referer
      });
      setIsLoading(false);
      setIsAuthenticated(false); // Don't set authenticated for admin routes
      skipAuthRef.current = true; // Set flag to prevent any auth checks
      return; // Exit early, don't run checkAuth at all - this prevents the entire useEffect from continuing
    }
    
    // Reset flag for non-admin routes
    skipAuthRef.current = false;

    const checkAuth = async (retryCount = 0): Promise<void> => {
      // Double-check admin route before proceeding
      const currentPathCheck = window.location.pathname;
      if (currentPathCheck.startsWith('/admin') || location.pathname.startsWith('/admin')) {
        setIsLoading(false);
        setIsAuthenticated(false);
        skipAuthRef.current = true;
        return;
      }

      // CRITICAL: Check for admin sessions FIRST - if admin is logged in, skip regular user auth
      // This prevents admins from being redirected to /dashboard when they have both admin and user sessions
      const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
      const superAdminLoggedIn = sessionStorage.getItem('superAdminLoggedIn') === 'true';
      if (adminLoggedIn || superAdminLoggedIn) {
        console.log('[AuthChecker] Admin session detected, skipping regular user auth check');
        setIsLoading(false);
        setIsAuthenticated(false); // Don't set authenticated for admin routes
        skipAuthRef.current = true;
        return; // Exit early - don't check regular user auth
      }

      // Check if we just logged in - use stored user data immediately
      const justLoggedIn = sessionStorage.getItem('justLoggedIn') === 'true';
      const storedUserData = sessionStorage.getItem('userData');
      
      // If we just logged in and have user data, set auth immediately
      if (justLoggedIn && storedUserData && retryCount === 0) {
        try {
          const userData = JSON.parse(storedUserData);
          console.log('[AuthChecker] Using stored user data from login');
          setIsAuthenticated(true);
          // Verify session in background (don't block) - wait longer for cookie to be ready
          setTimeout(async () => {
            // Skip background verification for admin routes
            if (location.pathname.startsWith('/admin')) {
              return;
            }
            try {
              // Wait a bit more before verifying
              await new Promise(resolve => setTimeout(resolve, 2000));
              // Double-check admin route before API call
              if (location.pathname.startsWith('/admin')) {
                return;
              }
              const res = await api.get("/auth/me");
              if (res.data?.status === "success" && res.data?.user) {
                console.log('[AuthChecker] Session verified in background');
                sessionStorage.removeItem('justLoggedIn');
                sessionStorage.removeItem('userData');
              } else {
                console.warn('[AuthChecker] Background verification returned invalid response, but user is authenticated');
              }
            } catch (err) {
              // Don't log errors for admin routes
              if (!location.pathname.startsWith('/admin')) {
                console.warn('[AuthChecker] Background session verification failed, but user is already authenticated using stored data');
              }
            }
          }, 2000);
          setIsLoading(false);
          return;
        } catch (err) {
          console.error('[AuthChecker] Failed to parse stored user data:', err);
        }
      }
      
      // If we just logged in, wait a bit for cookie to be ready
      if (justLoggedIn && retryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Final check before making any API calls - check current location and referer
      // Re-check currentPath in case location changed during async operations
      const finalPath = window.location.pathname;
      const referer = document.referrer;
      
      // Block if on admin route, navigating to admin route, or coming from admin route
      if (
        finalPath.startsWith('/admin') ||
        currentPath.startsWith('/admin') ||
        location.pathname.startsWith('/admin') ||
        (referer && (referer.includes('/admin') || referer.includes('/admin/login')))
      ) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        // Final check right before API call - use multiple checks
        const lastCheckPath = window.location.pathname;
        const lastCheckReferer = document.referrer;
        
        // Block if ANY check indicates admin route
        if (
          lastCheckPath.startsWith('/admin') || 
          currentPath.startsWith('/admin') ||
          location.pathname.startsWith('/admin') ||
          (lastCheckReferer && lastCheckReferer.includes('/admin'))
        ) {
          setIsLoading(false);
          setIsAuthenticated(false);
          return;
        }

        // Double-check one more time right before the actual API call
        if (window.location.pathname.startsWith('/admin')) {
          setIsLoading(false);
          setIsAuthenticated(false);
          return;
        }

        const res = await api.get("/auth/me");
        const authenticated = res.data?.status === "success" && res.data?.user;
        const user = res.data?.user;
        
        // Check if user is authenticated but email is not verified
        if (authenticated && user && !user.emailVerified && location.pathname.startsWith('/dashboard')) {
          console.log('[AuthChecker] User authenticated but email not verified, redirecting to verification');
          setIsAuthenticated(false);
          sessionStorage.setItem('pendingVerificationRedirect', location.pathname);
          window.location.href = '/verify-email';
          return;
        }
        
        setIsAuthenticated(authenticated);
        
        // Clear flags after successful authentication
        if (authenticated) {
          sessionStorage.removeItem('justLoggedIn');
          sessionStorage.removeItem('userData');
        }
        
        // If not authenticated, ensure we're not on a protected route
        if (!authenticated && location.pathname.startsWith('/dashboard')) {
          // If we just logged in, retry up to 2 more times
          if (justLoggedIn && retryCount < 2) {
            console.log(`[AuthChecker] Retry ${retryCount + 1}/2 - waiting for session cookie...`);
            return checkAuth(retryCount + 1);
          }
          // Clear flags if we've exhausted retries
          if (justLoggedIn) {
            sessionStorage.removeItem('justLoggedIn');
            sessionStorage.removeItem('userData');
          }
          window.location.href = '/login';
        }
      } catch (err: any) {
        // Skip error logging for admin routes - check both location sources
        const currentPath = window.location.pathname;
        const currentHref = window.location.href;
        
        // Check if request was cancelled (from interceptor) or if we're on admin route
        const isAdminRoute = 
          err.__cancelled ||
          location.pathname.startsWith('/admin') || 
          currentPath.startsWith('/admin') ||
          currentHref.includes('/admin') ||
          (err.config?.url?.includes('/auth/me') && (currentPath.startsWith('/admin') || currentHref.includes('/admin')));
        
        if (isAdminRoute) {
          setIsLoading(false);
          setIsAuthenticated(false);
          return;
        }

        // Only log errors for non-admin routes
        // Suppress 401 errors silently (they're expected for unauthenticated users)
        if (err.response?.status !== 401) {
          console.error('[AuthChecker] Auth check failed:', err);
        }
        setIsAuthenticated(false);
        
        // If auth check fails and we're on a protected route
        if (location.pathname.startsWith('/dashboard') || 
            location.pathname.startsWith('/pricing') ||
            location.pathname.startsWith('/payment') ||
            location.pathname.startsWith('/account')) {
          // If we just logged in, retry up to 2 more times
          if (justLoggedIn && retryCount < 2) {
            console.log(`[AuthChecker] Retry ${retryCount + 1}/2 after error - waiting for session cookie...`);
            return checkAuth(retryCount + 1);
          }
          // Clear flags if we've exhausted retries
          if (justLoggedIn) {
            sessionStorage.removeItem('justLoggedIn');
            sessionStorage.removeItem('userData');
          }
          window.location.href = '/login';
        }
      } finally {
        // Double-check admin route in finally block
        if (location.pathname.startsWith('/admin')) {
          setIsLoading(false);
          setIsAuthenticated(false);
          return;
        }
        setIsLoading(false);
      }
    };
    
    // Only run checkAuth if we're not on an admin route
    if (!skipAuthRef.current) {
      checkAuth();
    } else {
      setIsLoading(false);
      setIsAuthenticated(false);
    }
  }, [location.pathname]); // Re-check auth when route changes

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <MaintenanceChecker />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Homepage />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route path="/logincode" element={<LoginWithCode />} />
        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SignupPage />
            )
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/help" element={<HelpPage />} />

        {/* --- Protected Routes --- */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/pricing"
          element={
            isAuthenticated ? <PricingPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/payment"
          element={
            isAuthenticated ? <PaymentPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/payment-history"
          element={
            isAuthenticated ? <PaymentHistoryPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/account"
          element={
            isAuthenticated ? <AccountPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/monitoring"
          element={
            isAuthenticated ? <MonitoringDashboardPage /> : <Navigate to="/login" replace />
          }
        />

        {/* --- Admin Routes --- */}
        {/* Specific admin routes must come before wildcard routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/super-admin/register" element={<SuperAdminRegister />} />
        <Route path="/admin/super-admin/login" element={<SuperAdminLogin />} />
        {/* Admin dashboard routes - must come after specific routes */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
        <Route
          path="/admin/*"
          element={<AdminDashboard />}
        />

        {/* --- Catch-all (excludes admin routes) --- */}
        <Route 
          path="*" 
          element={<CatchAllRedirect />}
        />
      </Routes>
    </Suspense>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AuthChecker />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
