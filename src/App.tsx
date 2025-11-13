import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { ThemeProvider } from "./contexts/ThemeContext";

// --- LAZY LOADED PAGES (Code Splitting) ---
const Homepage = lazy(() => import("./pages/home"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const LoginPage = lazy(() => import("./pages/login"));
const LoginWithCode = lazy(() => import("./pages/loginwithcode"));
const SignupPage = lazy(() => import("./pages/signup"));
const ForgotPasswordPage = lazy(() => import("./pages/forgot-password"));
const PricingPage = lazy(() => import("./pages/pricing"));

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

const App: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/auth/me", { withCredentials: true });
        setIsAuthenticated(res.data?.status === "success");
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
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

          {/* --- Catch-all --- */}
          <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
