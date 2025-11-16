import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import api from "./utils/axios";
import { ThemeProvider } from "./contexts/ThemeContext";

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

// Component to handle auth checks on route changes
const AuthChecker: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async (retryCount = 0): Promise<void> => {
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
            try {
              // Wait a bit more before verifying
              await new Promise(resolve => setTimeout(resolve, 2000));
              const res = await api.get("/auth/me");
              if (res.data?.status === "success" && res.data?.user) {
                console.log('[AuthChecker] Session verified in background');
                sessionStorage.removeItem('justLoggedIn');
                sessionStorage.removeItem('userData');
              } else {
                console.warn('[AuthChecker] Background verification returned invalid response, but user is authenticated');
              }
            } catch (err) {
              console.warn('[AuthChecker] Background session verification failed, but user is already authenticated using stored data');
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
      
      try {
        const res = await api.get("/auth/me");
        const authenticated = res.data?.status === "success" && res.data?.user;
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
      } catch (err) {
        console.error('[AuthChecker] Auth check failed:', err);
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
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [location.pathname]); // Re-check auth when route changes

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
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

        {/* --- Catch-all --- */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthChecker />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
