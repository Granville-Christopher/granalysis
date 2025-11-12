import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Moon, Sun, Eye, EyeOff, Building2, Phone, Briefcase, Mail, Lock, User } from "lucide-react";
import api from "../../utils/axios";
import { Theme, ThemeConfig, THEME_CONFIG, 
  // getGlassmorphismClass
 } from "../home/theme";

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
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [theme, setTheme] = useState<Theme>('dark');
  const colors: ThemeConfig = theme === 'dark' ? THEME_CONFIG.dark : THEME_CONFIG.light;
  // const glassmorphismClass = getGlassmorphismClass(colors);
  const accentColor = colors.accent;

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");

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

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
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
    if (!email || !password) {
      setLoginError("Please fill in all fields.");
      return;
    }
    setLoginError("");
    try {
      const loginResponse = await api.post("/auth/login", { email, password });
      console.log('[Frontend] Login response:', loginResponse.headers);
      
      const userResponse = await api.get("/auth/me");
      console.log('[Frontend] /me response:', userResponse.headers);
      const message = `Logged in! Welcome ${userResponse.data.user.fullName}`;
      setLoginSuccess(message);
      setLoginError("");
      if (onLoginSuccess) {
        onLoginSuccess(userResponse.data.user);
      } else {
        window.location.reload();
      }
      console.log('Logged in:', userResponse.data);
    } catch (err: any) {
      setLoginSuccess("");
      setLoginError(err.response?.data?.message || "Login failed");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // Backend currently only accepts fullName, email, password
      // Additional fields (companyName, phone, businessType) can be added to backend later
      await api.post('/auth/register', { 
        fullName, 
        email: signupEmail, 
        password: signupPassword
      }, { withCredentials: true });
      window.location.reload();
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
    <div
      className="min-h-screen transition-colors duration-500 relative overflow-hidden"
      style={{
        background: backgroundStyle,
        fontFamily: "Inter, sans-serif",
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
                onSubmit={handleLogin}
                className="rounded-3xl md:p-8 p-4 space-y-6"
                style={cardStyle}
              >
                <div className="text-center mb-6">
                  <h2 className={`md:text-3xl text-xl font-bold mb-2 ${colors.text}`}>
                    Welcome Back
                  </h2>
                  <p className={`${colors.textSecondary} md:text-base text-xs`}>Login to your account</p>
                </div>

                {loginSuccess ? (
                  <div
                    className={`p-4 rounded-lg bg-green-500/20 border border-green-500/50 ${colors.text}`}
                  >
                    {loginSuccess}
                  </div>
                ) : (
                  loginError && (
                    <div
                      className={`p-4 rounded-lg bg-red-500/20 border border-red-500/50 ${colors.text}`}
                    >
                      {loginError}
                    </div>
                  )
                )}

                <div className="space-y-5">
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
                </div>

                <button
                  type="submit"
                  className="w-full py-3 text-sm md:text-base rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 4px 15px ${accentColor}40`,
                  }}
                >
                  Login
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

                {/* Google Login Button */}
                <button
                  type="button"
                  onClick={() => {
                    // TODO: Implement Google OAuth
                    console.log("Google login clicked");
                  }}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-3 ${
                    colors.isDark
                      ? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  style={{ backdropFilter: "blur(10px)" }}
                >
                  <GoogleIcon className="w-5 h-5" />
                  <span className="md:text-base text-xs">Login with Google</span>
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
                  scrollbarWidth: "thin",
                  scrollbarColor: colors.isDark
                    ? "rgba(79, 163, 255, 0.3) rgba(255, 255, 255, 0.05)"
                    : "#9ca3af #f3f4f6",
                }}
              >
                <div className="text-center mb-6">
                  <h2 className={`md:text-3xl text-xl font-bold mb-2 ${colors.text}`}>
                    Create Account
                  </h2>
                  <p className={`${colors.textSecondary} md:text-base text-xs`}>Sign up to get started</p>
                </div>

                {signupSuccess ? (
                  <div
                    className={`p-4 rounded-lg bg-green-500/20 border border-green-500/50 ${colors.text}`}
                  >
                    {signupSuccess}
                  </div>
                ) : (
                  signupError && (
                    <div
                      className={`p-4 rounded-lg bg-red-500/20 border border-red-500/50 ${colors.text}`}
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
                      style={{ backdropFilter: "blur(10px)" }}
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      required
                    >
                      <option value="">Select business type</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="retail">Retail</option>
                      <option value="wholesale">Wholesale</option>
                      <option value="saas">SaaS</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="other">Other</option>
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

                {/* Google Signup Button */}
                <button
                  type="button"
                  onClick={() => {
                    // TODO: Implement Google OAuth
                    console.log("Google signup clicked");
                  }}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-3 ${
                    colors.isDark
                      ? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  style={{ backdropFilter: "blur(10px)" }}
                >
                  <GoogleIcon className="w-5 h-5" />
                  <span>Sign up with Google</span>
                </button>

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
    </div>
  );
};

export default UnifiedAuth;

