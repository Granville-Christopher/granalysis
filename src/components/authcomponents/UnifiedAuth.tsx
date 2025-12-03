import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Moon, Sun, Eye, EyeOff, Building2, Phone, Briefcase, Mail, Lock, User } from "lucide-react";
import api from "../../utils/axios";
import { Theme, ThemeConfig, THEME_CONFIG, 
  // getGlassmorphismClass
 } from "../home/theme";
import { EmailVerificationModal } from "./EmailVerificationModal";
import MaintenanceModal from "../common/MaintenanceModal";

// Google Icon Component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

interface UnifiedAuthProps {
  onLoginSuccess?: (user: any) => void;
}

const UnifiedAuth: React.FC<UnifiedAuthProps> = ({ onLoginSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [theme, setTheme] = useState<Theme>('dark');
  const colors: ThemeConfig = theme === 'dark' ? THEME_CONFIG.dark : THEME_CONFIG.light;
  // const glassmorphismClass = getGlassmorphismClass(colors);
  const accentColor = colors.accent;
  const isLight = !colors.isDark;

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [isCodeLogin, setIsCodeLogin] = useState(false);
  const [codeRequested, setCodeRequested] = useState(false);
  const [loginCode, setLoginCode] = useState("");
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorMessage, setTwoFactorMessage] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  // Signup state
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  useEffect(() => {
    const checkMaintenance = async () => {
      // Skip maintenance check for admin routes - maintenance mode only affects regular users
      if (location.pathname.startsWith('/admin')) {
        setMaintenanceMode(false);
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
      }
    };

    checkMaintenance();
    // Check every 30 seconds
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const switchToSignup = () => {
    setIsLogin(false);
    setLoginError("");
    setLoginSuccess("");
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setSignupError("");
    setSignupSuccess("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCodeLogin) {
      if (!email) {
        setLoginError("Please enter your email.");
        return;
      }
      setLoginError("");
      try {
        if (!codeRequested) {
          const res = await api.post('/auth/login-code/request', { email }, { withCredentials: true });
          if (res.data?.status === 'success') {
            setCodeRequested(true);
            setLoginSuccess('We sent a 6‑digit code to your email.');
          } else {
            setLoginError(res.data?.message || 'Failed to request code');
          }
          return;
        } else {
          if (!loginCode || loginCode.trim().length !== 6) {
            setLoginError('Enter the 6‑digit code from your email.');
            return;
          }
          const verify = await api.post('/auth/login-code/verify', { email, code: loginCode.trim() }, { withCredentials: true });
          if (verify.data?.status === 'success' && verify.data?.user) {
            sessionStorage.setItem('justLoggedIn', 'true');
            sessionStorage.setItem('userData', JSON.stringify(verify.data.user));
            setLoginSuccess('Logged in with code!');
            await new Promise(r => setTimeout(r, 200));
            navigate('/dashboard', { replace: true });
            return;
          } else {
            setLoginError(verify.data?.message || 'Invalid or expired code');
            return;
          }
        }
      } catch (err: any) {
        setLoginError(err.response?.data?.message || 'Login with code failed');
        return;
      }
    }
    if (!email || !password) {
      setLoginError("Please fill in all fields.");
      return;
    }
    setLoginError("");
    try {
      const loginResponse = await api.post("/auth/login", { email, password }, { withCredentials: true });
      console.log('[Frontend] Login response:', loginResponse.data);
      
      // If 2FA is required, show code prompt
      if (loginResponse.data?.status === '2fa_required') {
        setTwoFactorRequired(true);
        setTwoFactorMessage("A verification code has been sent to your email. Enter it below to complete login.");
        setLoginSuccess("");
        return;
      }
      
      // Login response already contains user data
      if (loginResponse.data?.status === 'success' && loginResponse.data?.user) {
        const message = `Logged in! Welcome ${loginResponse.data.user.fullName}`;
        setLoginSuccess(message);
        setLoginError("");
        
        // Wait for session cookie to be set, then verify it works
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Verify session is actually working before redirecting
        try {
          const verifyResponse = await api.get("/auth/me", { withCredentials: true });
          if (verifyResponse.data?.status === 'success' && verifyResponse.data?.user) {
            console.log('[Frontend] Session verified, redirecting...');
            // Store user data and flag in sessionStorage for immediate auth
            sessionStorage.setItem('justLoggedIn', 'true');
            sessionStorage.setItem('userData', JSON.stringify(loginResponse.data.user));
            if (onLoginSuccess) {
              onLoginSuccess(loginResponse.data.user);
            } else {
              // Use navigate instead of window.location.href to avoid full page reload
              // This keeps the session cookie available
              navigate('/dashboard', { replace: true });
            }
          } else {
            // Session not ready, wait a bit more and try again
            sessionStorage.setItem('justLoggedIn', 'true');
            sessionStorage.setItem('userData', JSON.stringify(loginResponse.data.user));
            await new Promise(resolve => setTimeout(resolve, 500));
            navigate('/dashboard', { replace: true });
          }
        } catch (verifyErr) {
          console.warn('[Frontend] Session verification failed, redirecting anyway:', verifyErr);
          // Still redirect - session might be set but verification failed
          // Store flag and user data
          sessionStorage.setItem('justLoggedIn', 'true');
          sessionStorage.setItem('userData', JSON.stringify(loginResponse.data.user));
          await new Promise(resolve => setTimeout(resolve, 500));
          navigate('/dashboard', { replace: true });
        }
        
        console.log('Logged in:', loginResponse.data);
      } else {
        throw new Error('Login failed - invalid response');
      }
    } catch (err: any) {
      console.error('[Frontend] Login error:', err);
      setLoginSuccess("");
      setLoginError(err.response?.data?.message || err.message || "Login failed");
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode || twoFactorCode.trim().length !== 6) {
      setTwoFactorMessage("Enter the 6‑digit code sent to your email.");
      return;
    }
    try {
      const verify = await api.post("/auth/2fa/verify", { code: twoFactorCode.trim() }, { withCredentials: true });
      if (verify.data?.status === 'success' && verify.data?.user) {
        setTwoFactorMessage("2FA verified. Redirecting...");
        // Store user data and flag for immediate auth
        sessionStorage.setItem('justLoggedIn', 'true');
        sessionStorage.setItem('userData', JSON.stringify(verify.data.user));
        await new Promise(r => setTimeout(r, 300));
        navigate('/dashboard', { replace: true });
      } else {
        setTwoFactorMessage(verify.data?.message || "Invalid or expired 2FA code.");
      }
    } catch (err: any) {
      setTwoFactorMessage(err.response?.data?.message || "2FA verification failed.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent signup if maintenance mode is on
    if (maintenanceMode) {
      setSignupError('System is under maintenance. Please try again later.');
      return;
    }
    if (!fullName || !signupEmail || !signupPassword || !confirmPassword || !companyName || !phone || !businessType) {
      setSignupError("Please fill in all fields.");
      return;
    }
    if (signupPassword.length < 8) {
      setSignupError("Password must be at least 8 characters.");
      return;
    }
    if (signupPassword !== confirmPassword) {
      setSignupError("Passwords do not match.");
      return;
    }
    setSignupError("");
    try {
      const registerResponse = await api.post('/auth/register', { 
        fullName, 
        email: signupEmail, 
        password: signupPassword,
        companyName,
        phone,
        businessType
      }, { withCredentials: true });
      
      console.log('[Frontend] Register response:', registerResponse.data);
      
      if (registerResponse.data?.status === 'success' && registerResponse.data?.user) {
        // Registration response already contains user data
        const user = registerResponse.data.user;
        
        // Check if email is verified
        if (!user.emailVerified) {
          // Show email verification modal
          setShowEmailVerification(true);
          setSignupSuccess('Registration successful! Please verify your email.');
          return;
        }
        
        // Email already verified, proceed with login
        setSignupSuccess('Registration successful! Redirecting...');
        
        // Wait for session cookie to be set, then verify it works
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Verify session is actually working before redirecting
        try {
          const verifyResponse = await api.get("/auth/me", { withCredentials: true });
          if (verifyResponse.data?.status === 'success' && verifyResponse.data?.user) {
            console.log('[Frontend] Session verified after registration, redirecting...');
            // Store flag and user data
            sessionStorage.setItem('justLoggedIn', 'true');
            sessionStorage.setItem('userData', JSON.stringify(user));
            if (onLoginSuccess) {
              onLoginSuccess(user);
            } else {
              // Use navigate instead of window.location.href to avoid full page reload
              navigate('/dashboard', { replace: true });
            }
          } else {
            // Session not ready, wait a bit more and try again
            sessionStorage.setItem('justLoggedIn', 'true');
            sessionStorage.setItem('userData', JSON.stringify(user));
            await new Promise(resolve => setTimeout(resolve, 500));
            navigate('/dashboard', { replace: true });
          }
        } catch (verifyErr) {
          console.warn('[Frontend] Session verification failed after registration, redirecting anyway:', verifyErr);
          // Still redirect - session might be set but verification failed
          // Store flag and user data
          sessionStorage.setItem('justLoggedIn', 'true');
          sessionStorage.setItem('userData', JSON.stringify(user));
          await new Promise(resolve => setTimeout(resolve, 500));
          navigate('/dashboard', { replace: true });
        }
      } else {
        setSignupError('Registration failed. Please try again.');
      }
    } catch (err: any) {
      setSignupSuccess("");
      setSignupError(err.response?.data?.message || "Signup failed");
    }
  };

  const backgroundStyle = colors.isDark
    ? `radial-gradient(ellipse at center, #1A345B 0%, ${colors.bg} 100%)`
    : `linear-gradient(180deg, #F9FAFB 0%, ${colors.bg} 100%)`;

  const networkGlow = colors.isDark ? '#4FA3FF' : '#1D4ED8';

  // Enhanced glassmorphism for cards
  const cardStyle = {
    background: colors.isDark 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    border: colors.isDark 
      ? '1px solid rgba(255, 255, 255, 0.1)' 
      : '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: colors.isDark
      ? `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(79, 163, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
      : `0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
  };

  return (
    <>
      {maintenanceMode && <MaintenanceModal message={maintenanceMessage} />}
      <div
        className={`min-h-screen transition-colors duration-500 relative overflow-hidden ${isLight ? 'auth-light' : ''}`}
        style={{
          background: backgroundStyle,
          fontFamily: "Inter, sans-serif",
          filter: maintenanceMode ? 'blur(10px)' : 'none',
          pointerEvents: maintenanceMode ? 'none' : 'auto',
        }}
      >
      <style>{`
        body { background-color: ${
          colors.bg
        }; transition: background-color 0.5s; }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-30px) translateX(10px); }
          66% { transform: translateY(30px) translateX(-10px); }
        }
        .animate-float { animation: float linear infinite; }
        @keyframes move-bg { 
          from { background-position: 0 0; } 
          to { background-position: 4000px 4000px; } 
        }
        .auth-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .auth-scrollbar::-webkit-scrollbar-track {
          background: ${
            colors.isDark ? "rgba(255, 255, 255, 0.05)" : "#f3f4f6"
          };
          border-radius: 10px;
        }
        .auth-scrollbar::-webkit-scrollbar-thumb {
          background: ${colors.isDark ? "rgba(79, 163, 255, 0.3)" : "#9ca3af"};
          border-radius: 10px;
        }
        .auth-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${colors.isDark ? "rgba(79, 163, 255, 0.5)" : "#6b7280"};
        }
        /* Select dropdown styling */
        select option {
          background-color: ${colors.isDark ? '#0B1B3B' : '#ffffff'} !important;
          color: ${colors.isDark ? '#ffffff' : '#111827'} !important;
        }
        select option:hover,
        select option:focus,
        select option:checked {
          background-color: ${colors.isDark ? '#1A345B' : '#f3f4f6'} !important;
          color: ${colors.isDark ? '#ffffff' : '#111827'} !important;
        }
        /* Ensure readable text in light mode */
        .auth-light, 
        .auth-light p:not(.pw-match):not(.pw-mismatch),
        .auth-light label,
        .auth-light span,
        .auth-light h1,
        .auth-light h2,
        .auth-light h3,
        .auth-light h4 {
          color: #111827 !important;
        }
        /* Explicit password match feedback colors */
        .pw-match { color: #22c55e !important; font-weight: 600; }
        .pw-mismatch { color: #ef4444 !important; font-weight: 600; }
        .auth-light input,
        .auth-light select,
        .auth-light textarea {
          color: #111827 !important;
          background-color: rgba(255,255,255,0.9);
          -webkit-text-fill-color: #111827 !important; /* ensure visible text in WebKit */
        }
        .auth-light ::placeholder {
          color: #6b7280 !important;
          opacity: 1;
        }
      `}</style>

      {/* Animated Background */}
      <div
        className="absolute inset-0 opacity-20 z-0 pointer-events-none overflow-hidden"
        style={{
          backgroundImage: colors.isDark
            ? `radial-gradient(circle, ${networkGlow} 1px, transparent 1px)`
            : `radial-gradient(circle, ${networkGlow} 0.5px, transparent 0.5px)`,
          backgroundSize: "40px 40px",
          animation: "move-bg 60s linear infinite",
        }}
      ></div>

      {/* Floating Particles (Dark Mode Only) */}
      {colors.isDark && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                backgroundColor: accentColor,
                opacity: Math.random() * 0.5 + 0.2,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed md:top-6 top-3 md:right-6 right-3 z-50 p-3 rounded-full transition-all duration-300 ${colors.text} hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2`}
        style={{
          backgroundColor: colors.isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
        }}
        aria-label="Toggle theme"
      >
        {colors.isDark ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-gray-800" />
        )}
      </button>

      <div className="relative z-10 min-h-screen flex items-center max-w-[1400px] mx-auto">
        {/* Left Side - Logo and Description */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative">
          <div className="max-w-lg text-center space-y-8">
            <div>
              <h1
                className="text-6xl font-extrabold mb-4 tracking-tight"
                style={{
                  color: accentColor,
                  textShadow: colors.isDark
                    ? `0 0 20px ${accentColor}, 0 0 40px rgba(79, 163, 255, 0.5)`
                    : "none",
                }}
              >
                Granalysis
              </h1>
              <div
                className="h-1 w-24 mx-auto rounded-full"
                style={{ backgroundColor: accentColor }}
              ></div>
            </div>

            <div className="space-y-4">
              <h2
                className={`text-3xl font-bold ${colors.text} transition-opacity duration-500`}
              >
                {isLogin ? "Login to" : "Sign up to"}
              </h2>
              <p className={`text-xl ${colors.textSecondary} leading-relaxed`}>
                {isLogin
                  ? "Access your AI-powered data analytics dashboard and unlock insights that drive your ecommerce business forward."
                  : "Join thousands of businesses leveraging AI to transform their data into actionable insights and boost sales performance."}
              </p>
            </div>

            <div className={`pt-8 space-y-4 ${colors.textSecondary}`}>
              <div className="flex items-center justify-center space-x-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                ></div>
                <span>AI-Powered Analytics</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                ></div>
                <span>Ecommerce Integration</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                ></div>
                <span>Real-time Insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center md:py-6 py-2 md:px-6 px-4 ">
          <div className="w-full max-w-3xl relative ">
            {/* Login Form */}
            <div
              className={`absolute inset-0 transition-all duration-500 -top-[300px] ${
                isLogin
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <form
                onSubmit={twoFactorRequired ? handleVerify2FA : handleLogin}
                className="rounded-3xl md:p-8 p-4 space-y-6"
                style={{
                  ...cardStyle,
                  // Ensure readable text in light mode
                  color: colors.isDark ? undefined : '#111827',
                }}
              >
                <div className="text-center mb-6">
                  <h2 
                    className={`md:text-3xl text-xl font-bold mb-2`}
                    style={{ color: colors.isDark ? '#FFFFFF' : '#111827' }}
                  >
                    Welcome Back
                  </h2>
                  <p 
                    className={`md:text-base text-xs`}
                    style={{ color: colors.isDark ? '#E5E7EB' : '#6b7280' }}
                  >
                    Login to your account
                  </p>
                </div>

                {loginSuccess ? (
                  <div
                    className={`p-4 rounded-lg bg-green-500/20 border border-green-500/50`}
                    style={{ color: colors.isDark ? '#FFFFFF' : '#111827' }}
                  >
                    {loginSuccess}
                  </div>
                ) : (
                  loginError && (
                    <div
                      className={`p-4 rounded-lg bg-red-500/20 border border-red-500/50`}
                      style={{ color: colors.isDark ? '#FFFFFF' : '#111827' }}
                    >
                      {loginError}
                    </div>
                  )
                )}

                <div className="space-y-5">
                  {!twoFactorRequired && !isCodeLogin ? (
                    <>
                      <div>
                        <label
                          className={`block mb-2 font-medium ${colors.textSecondary} flex items-center space-x-2`}
                        >
                          <Mail className="w-4 h-4" />
                          <span className="md:text-base text-xs">Email</span>
                        </label>
                        <input
                          type="email"
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            colors.isDark
                              ? "bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50"
                              : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50"
                          }`}
                          style={{ backdropFilter: "blur(10px)" }}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>

                      <div>
                        <label
                          className={`block mb-2 font-medium ${colors.textSecondary} flex items-center space-x-2`}
                        >
                          <Lock className="w-4 h-4" />
                          <span className="md:text-base text-xs">Password</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 pr-12 ${
                              colors.isDark
                                ? "bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50"
                                : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50"
                            }`}
                            style={{ backdropFilter: "blur(10px)" }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${colors.textSecondary} hover:${colors.text} transition-colors`}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : isCodeLogin ? (
                    <>
                      <div>
                        <label
                          className={`block mb-2 font-medium ${colors.textSecondary} flex items-center space-x-2`}
                        >
                          <Mail className="w-4 h-4" />
                          <span className="md:text-base text-xs">Email</span>
                        </label>
                        <input
                          type="email"
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            colors.isDark
                              ? "bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50"
                              : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50"
                          }`}
                          style={{ backdropFilter: "blur(10px)" }}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      {codeRequested && (
                        <div>
                          <label
                            className={`block mb-2 font-medium ${colors.textSecondary} flex items-center space-x-2`}
                          >
                            <Lock className="w-4 h-4" />
                            <span className="md:text-base text-xs">Code</span>
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              colors.isDark
                                ? "bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50"
                                : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50"
                            }`}
                            style={{ backdropFilter: "blur(10px)" }}
                            value={loginCode}
                            onChange={(e) => setLoginCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="6‑digit code"
                            required
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className={`p-3 rounded-lg ${colors.isDark ? 'bg-white/10' : 'bg-gray-100'} ${colors.text}`}>
                        {twoFactorMessage || 'Enter the 6‑digit code sent to your email.'}
                      </div>
                      <div>
                        <label
                          className={`block mb-2 font-medium ${colors.textSecondary} flex items-center space-x-2`}
                        >
                          <Lock className="w-4 h-4" />
                          <span className="md:text-base text-xs">2FA Code</span>
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            colors.isDark
                              ? "bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50"
                              : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50"
                          }`}
                          style={{ backdropFilter: "blur(10px)" }}
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter 6‑digit code"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 text-sm md:text-base rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 4px 15px ${accentColor}40`,
                  }}
                >
                  {isCodeLogin ? (codeRequested ? 'Verify & Login' : 'Get Code') : (twoFactorRequired ? 'Verify Code' : 'Login')}
                </button>

                {/* Divider */}
                <div className="relative my-6 flex items-center">
                  <div
                    className={`flex-1 border-t ${
                      colors.isDark ? "border-white/10" : "border-gray-300"
                    }`}
                  ></div>
                  <span
                    className={`px-4 text-sm ${colors.textSecondary}`}
                  >
                    Or
                  </span>
                  <div
                    className={`flex-1 border-t ${
                      colors.isDark ? "border-white/10" : "border-gray-300"
                    }`}
                  ></div>
                </div>

                {/* Toggle between password and code login */}
                <button
                  type="button"
                  onClick={() => {
                    setIsCodeLogin(!isCodeLogin);
                    setCodeRequested(false);
                    setLoginCode('');
                    setLoginError('');
                    setLoginSuccess('');
                    setTwoFactorRequired(false);
                  }}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-3 ${
                    colors.isDark
                      ? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  style={{ backdropFilter: "blur(10px)" }}
                >
                  <span className="md:text-base text-xs">{isCodeLogin ? 'Login with Password' : 'Login with Code'}</span>
                </button>

                <div className="text-center space-y-2">
                  <p className={colors.textSecondary}>
                    <Link
                      to="/forgot-password"
                      className="md:text-base text-xs font-semibold transition-colors hover:underline"
                      style={{ color: accentColor }}
                    >
                      Forgot password? Reset password here
                    </Link>
                  </p>
                  <p className={colors.textSecondary}>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={switchToSignup}
                      className="md:text-base text-xs font-semibold transition-colors hover:underline"
                      style={{ color: accentColor }}
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {/* Signup Form */}
            <div
              className={`absolute inset-0 -top-[360px] md:-top-[350px] transition-all duration-500 ${
                !isLogin
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <form
                onSubmit={handleSignup}
                className="rounded-3xl md:p-8 p-4 space-y-6 max-h-[90vh] overflow-y-auto auth-scrollbar"
                style={{
                  ...cardStyle,
                  // Ensure readable text in light mode
                  color: colors.isDark ? undefined : '#111827',
                  scrollbarWidth: "thin",
                  scrollbarColor: colors.isDark
                    ? "rgba(79, 163, 255, 0.3) rgba(255, 255, 255, 0.05)"
                    : "#9ca3af #f3f4f6",
                }}
              >
                <div className="text-center mb-6">
                  <h2 
                    className={`md:text-3xl text-xl font-bold mb-2`}
                    style={{ color: colors.isDark ? '#FFFFFF' : '#111827' }}
                  >
                    Create Account
                  </h2>
                  <p 
                    className={`md:text-base text-xs`}
                    style={{ color: colors.isDark ? '#E5E7EB' : '#6b7280' }}
                  >
                    Sign up to get started
                  </p>
                </div>

                {signupSuccess ? (
                  <div
                    className={`p-4 rounded-lg bg-green-500/20 border border-green-500/50`}
                    style={{ color: colors.isDark ? '#FFFFFF' : '#111827' }}
                  >
                    {signupSuccess}
                  </div>
                ) : (
                  signupError && (
                    <div
                      className={`p-4 rounded-lg bg-red-500/20 border border-red-500/50`}
                      style={{ color: colors.isDark ? '#FFFFFF' : '#111827' }}
                    >
                      {signupError}
                    </div>
                  )
                )}

                <div className="space-y-5">
                  {/* Full Name and Email - Side by Side */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label
                        className={`block mb-2 font-medium ${colors.textSecondary} flex items-center space-x-2`}
                      >
                        <User className="w-4 h-4" />
                        <span className="md:text-base text-xs">Full Name</span>
                      </label>
                      <input
                        type="text"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          colors.isDark
                            ? "bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50"
                            : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50"
                        }`}
                        style={{ backdropFilter: "blur(10px)" }}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full name"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        className={`block mb-2 font-medium ${colors.textSecondary} flex items-center space-x-2`}
                      >
                        <Mail className="w-4 h-4" />
                        <span className="md:text-base text-xs">Email</span>
                      </label>
                      <input
                        type="email"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          colors.isDark
                            ? "bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50"
                            : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50"
                        }`}
                        style={{ backdropFilter: "blur(10px)" }}
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="Email address"
                        required
                      />
                    </div>
                  </div>

                  {/* Company Name and Phone - Side by Side */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label
                        className={`block mb-2 font-medium ${colors.textSecondary} flex items-center space-x-2`}
                      >
                        <Building2 className="w-4 h-4" />
                        <span className="md:text-base text-xs">Company Name</span>
                      </label>
                      <input
                        type="text"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          colors.isDark
                            ? "bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50"
                            : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50"
                        }`}
                        style={{ backdropFilter: "blur(10px)" }}
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Company name"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        className={`block mb-2 font-medium ${colors.textSecondary} flex items-center space-x-2`}
                      >
                        <Phone className="w-4 h-4" />
                        <span>Phone Number</span>
                      </label>
                      <input
                        type="tel"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          colors.isDark
                            ? "bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50"
                            : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50"
                        }`}
                        style={{ backdropFilter: "blur(10px)" }}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone number"
                        required
                      />
                    </div>
                  </div>

                  {/* Business Type - Full Width */}
                  <div>
                    <label
                      className={`block mb-2 font-medium ${colors.textSecondary} flex items-center space-x-2`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Business Type</span>
                    </label>
                    <select
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        colors.isDark
                          ? "bg-white/5 border-white/10 text-white focus:border-blue-400 focus:ring-blue-400/50"
                          : "bg-white/80 border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/50"
                      }`}
                      style={{
                        backdropFilter: "blur(10px)",
                        color: colors.isDark ? '#ffffff' : '#111827',
                        backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                        WebkitTextFillColor: colors.isDark ? '#ffffff' : '#111827',
                      }}
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      required
                    >
                      <option value="" style={{ color: colors.isDark ? '#ffffff' : '#111827', backgroundColor: colors.isDark ? '#0B1B3B' : '#ffffff' }}>
                        Select business type
                      </option>
                      <option value="ecommerce" style={{ color: colors.isDark ? '#ffffff' : '#111827', backgroundColor: colors.isDark ? '#0B1B3B' : '#ffffff' }}>
                        E-commerce
                      </option>
                      <option value="retail" style={{ color: colors.isDark ? '#ffffff' : '#111827', backgroundColor: colors.isDark ? '#0B1B3B' : '#ffffff' }}>
                        Retail
                      </option>
                      <option value="wholesale" style={{ color: colors.isDark ? '#ffffff' : '#111827', backgroundColor: colors.isDark ? '#0B1B3B' : '#ffffff' }}>
                        Wholesale
                      </option>
                      <option value="saas" style={{ color: colors.isDark ? '#ffffff' : '#111827', backgroundColor: colors.isDark ? '#0B1B3B' : '#ffffff' }}>
                        SaaS
                      </option>
                      <option value="manufacturing" style={{ color: colors.isDark ? '#ffffff' : '#111827', backgroundColor: colors.isDark ? '#0B1B3B' : '#ffffff' }}>
                        Manufacturing
                      </option>
                      <option value="other" style={{ color: colors.isDark ? '#ffffff' : '#111827', backgroundColor: colors.isDark ? '#0B1B3B' : '#ffffff' }}>
                        Other
                      </option>
                    </select>
                  </div>

                  {/* Password and Confirm Password - Side by Side */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label
                        className={`block mb-2 font-medium ${colors.textSecondary} flex items-center space-x-2`}
                      >
                        <Lock className="w-4 h-4" />
                        <span>Password</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 pr-12 ${
                            colors.isDark
                              ? "bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50"
                              : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50"
                          }`}
                          style={{ backdropFilter: "blur(10px)" }}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Password (min. 8)"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowSignupPassword(!showSignupPassword)
                          }
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${colors.textSecondary} hover:${colors.text} transition-colors`}
                          tabIndex={-1}
                        >
                          {showSignupPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label
                        className={`block mb-2 font-medium ${colors.textSecondary} flex items-center space-x-2`}
                      >
                        <Lock className="w-4 h-4" />
                        <span>Confirm Password</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 pr-12 ${
                            colors.isDark
                              ? "bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50"
                              : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50"
                          }`}
                          style={{ backdropFilter: "blur(10px)" }}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${colors.textSecondary} hover:${colors.text} transition-colors`}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {/* Password match feedback */}
                      {confirmPassword.length > 0 && (
                        <p
                          className={`mt-2 text-sm ${confirmPassword === signupPassword ? 'pw-match' : 'pw-mismatch'}`}
                        >
                          {confirmPassword === signupPassword ? 'Passwords match' : 'Passwords do not match'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 4px 15px ${accentColor}40`,
                  }}
                >
                  Sign Up
                </button>

                {/* Divider */}
                <div className="relative my-6 flex items-center">
                  <div
                    className={`flex-1 border-t ${
                      colors.isDark ? "border-white/10" : "border-gray-300"
                    }`}
                  ></div>
                  <span
                    className={`px-4 text-sm ${colors.textSecondary}`}
                  >
                    Or 
                  </span>
                  <div
                    className={`flex-1 border-t ${
                      colors.isDark ? "border-white/10" : "border-gray-300"
                    }`}
                  ></div>
                </div>

                {/* Removed Google signup button */}

                <div className="text-center">
                  <p className={colors.textSecondary}>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={switchToLogin}
                      className="font-semibold transition-colors hover:underline"
                      style={{ color: accentColor }}
                    >
                      Login
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {maintenanceMode && <MaintenanceModal message={maintenanceMessage} />}
      
      {showEmailVerification && (
        <EmailVerificationModal
          email={signupEmail}
          onVerified={async () => {
            setShowEmailVerification(false);
            // Refresh user data to get updated emailVerified status
            try {
              const verifyResponse = await api.get("/auth/me", { withCredentials: true });
              if (verifyResponse.data?.status === 'success' && verifyResponse.data?.user) {
                const user = verifyResponse.data.user;
                sessionStorage.setItem('justLoggedIn', 'true');
                sessionStorage.setItem('userData', JSON.stringify(user));
                if (onLoginSuccess) {
                  onLoginSuccess(user);
                } else {
                  navigate('/dashboard', { replace: true });
                }
              }
            } catch (err) {
              console.error('Failed to verify session after email verification:', err);
              // Still redirect
              navigate('/dashboard', { replace: true });
            }
          }}
          onResend={() => {
            // Resend is handled in the modal
          }}
        />
      )}
      </div>
    </>
  );
};

export default UnifiedAuth;

