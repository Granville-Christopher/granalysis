import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Moon, Sun, Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { Theme, ThemeConfig, THEME_CONFIG } from "../home/theme";

const ForgotPassword: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const colors: ThemeConfig = theme === 'dark' ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const accentColor = colors.accent;
  const isLight = !colors.isDark;
  const navigate = useNavigate();

  // State for email-only form
  const [email, setEmail] = useState("");
  // State for reset form
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post('/auth/forgot-password', { email }, { withCredentials: true });
      if (res.data?.status === 'success') {
        setOtpSent(true);
        setSuccess("If the email exists, a reset code has been sent to " + email);
      } else {
        setError(res.data?.message || "Failed to send reset code. Please try again.");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !otp || !newPassword || !confirmNewPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post(
        '/auth/reset-password',
        {
          email: resetEmail,
          code: otp,
          password: newPassword,
        },
        { withCredentials: true }
      );
      if (res.data?.status === 'success') {
        setSuccess("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(res.data?.message || "Failed to reset password. Please try again.");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
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
      className={`min-h-screen transition-colors duration-500 relative overflow-hidden ${isLight ? 'fp-light' : ''}`}
      style={{ 
        background: backgroundStyle,
        fontFamily: "Inter, sans-serif"
      }}
    >
      <style>{`
        body { background-color: ${colors.bg}; transition: background-color 0.5s; }
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
        /* Force readable text in light mode */
        .fp-light,
        .fp-light p,
        .fp-light label,
        .fp-light span,
        .fp-light h1,
        .fp-light h2,
        .fp-light h3,
        .fp-light h4 {
          color: #111827 !important;
        }
        .fp-light input,
        .fp-light select,
        .fp-light textarea {
          color: #111827 !important;
          -webkit-text-fill-color: #111827 !important;
          background-color: rgba(255,255,255,0.9);
        }
        .fp-light ::placeholder {
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

      <div className="relative z-10 min-h-screen flex items-center justify-center md:p-6 p-4">
        <div className="w-full max-w-4xl">
          {/* Back to Login Link */}
          <div
            className="mb-6 fixed top-3 left-3 z-50 backdrop-blur-sm p-2 rounded-lg"
            style={{
              backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              border: colors.isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-2 transition-colors"
              style={{ color: colors.isDark ? accentColor : '#111827', fontWeight: 600 }}
            >
              <ArrowLeft className="w-4 h-4" color={colors.isDark ? accentColor : '#111827'} />
              <span>Back to login</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:mt-0 mt-12">
            {/* Request OTP Form */}
            <div
              className="rounded-3xl md:p-8 p-4 space-y-6"
              style={cardStyle}
            >
              <div className="text-center mb-6">
                <h2 className={`md:text-3xl text-xl font-bold mb-2 ${colors.text}`}>
                  Forgot Password
                </h2>
                <p className={`${colors.textSecondary} md:text-base text-xs`}>
                  Enter your email to receive a reset code
                </p>
              </div>

              {success && !otpSent && (
                <div className={`p-4 rounded-lg bg-green-500/20 border border-green-500/50 ${colors.text}`}>
                  {success}
                </div>
              )}
              {error && !otpSent && (
                <div className={`p-4 rounded-lg bg-red-500/20 border border-red-500/50 ${colors.text}`}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-5">
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
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-sm md:text-base rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 4px 15px ${accentColor}40`,
                  }}
                >
                  {loading ? 'Sending...' : 'Get Reset Code'}
                </button>
              </form>
            </div>

            {/* Reset Password Form */}
            <div
              className="rounded-3xl md:p-8 p-4 space-y-6"
              style={cardStyle}
            >
              <div className="text-center mb-6">
                <h2 className={`md:text-3xl text-xl font-bold mb-2 ${colors.text}`}>
                  Reset Password
                </h2>
                <p className={`${colors.textSecondary} md:text-base text-xs`}>
                  Enter OTP and new password
                </p>
              </div>

              {success && otpSent && (
                <div className={`p-4 rounded-lg bg-green-500/20 border border-green-500/50 ${colors.text}`}>
                  {success}
                </div>
              )}
              {error && otpSent && (
                <div className={`p-4 rounded-lg bg-red-500/20 border border-red-500/50 ${colors.text}`}>
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
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
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    className={`block mb-2 font-medium ${colors.textSecondary} flex items-center space-x-2`}
                  >
                    <Lock className="w-4 h-4" />
                    <span className="md:text-base text-xs">OTP Code</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      colors.isDark
                        ? "bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50"
                        : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50"
                    }`}
                    style={{ backdropFilter: "blur(10px)" }}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    required
                    maxLength={6}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    className={`block mb-2 font-medium ${colors.textSecondary} flex items-center space-x-2`}
                  >
                    <Lock className="w-4 h-4" />
                    <span className="md:text-base text-xs">New Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 pr-12 ${
                        colors.isDark
                          ? "bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50"
                          : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50"
                      }`}
                      style={{ backdropFilter: "blur(10px)" }}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${colors.textSecondary} hover:${colors.text} transition-colors`}
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className={`block mb-2 font-medium ${colors.textSecondary} flex items-center space-x-2`}
                  >
                    <Lock className="w-4 h-4" />
                    <span className="md:text-base text-xs">Confirm New Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 pr-12 ${
                        colors.isDark
                          ? "bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50"
                          : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50"
                      }`}
                      style={{ backdropFilter: "blur(10px)" }}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${colors.textSecondary} hover:${colors.text} transition-colors`}
                      tabIndex={-1}
                    >
                      {showConfirmNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-sm md:text-base rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 4px 15px ${accentColor}40`,
                  }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
