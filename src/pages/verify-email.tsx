import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/axios";
import { useTheme } from "../contexts/ThemeContext";
import { THEME_CONFIG, ThemeConfig } from "../components/home/theme";
import { CheckCircle, XCircle, Mail, ArrowRight } from "lucide-react";

const VerifyEmailPage: React.FC = () => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [hasVerified, setHasVerified] = useState(false);

  useEffect(() => {
    // Prevent multiple verifications
    if (hasVerified) return;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing');
      return;
    }

    const verify = async () => {
      setHasVerified(true); // Mark as verifying to prevent duplicate calls
      try {
        const res = await api.post('/auth/verify-email', { token });
        if (res.data?.status === 'success') {
          setStatus('success');
          setMessage('Email verified successfully!');
          setTimeout(() => navigate('/dashboard'), 3000);
        } else {
          setStatus('error');
          setMessage(res.data?.message || 'Verification failed');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [searchParams, navigate, hasVerified]);

  const handleResend = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }
    try {
      const res = await api.post('/auth/resend-verification', { email });
      if (res.data?.status === 'success') {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(res.data?.message || 'Failed to resend verification email');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to resend verification email');
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300`}
      style={{ 
        backgroundColor: colors.isDark ? '#0B1B3B' : '#F9FAFB',
        transition: 'background-color 0.3s ease'
      }}
    >
      <div
        className={`max-w-md w-full p-8 rounded-2xl shadow-xl transition-all duration-300`}
        style={{
          backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}
      >
        {status === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 mx-auto mb-4" style={{ borderColor: colors.accent }}></div>
            <h2 className={`text-2xl font-bold mb-2 ${colors.text}`}>Verifying Email...</h2>
            <p className={colors.textSecondary}>Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#10b981' }} />
            <h2 className={`text-2xl font-bold mb-2 ${colors.text}`}>Email Verified!</h2>
            <p className={`mb-6 ${colors.textSecondary}`}>
              Your email has been successfully verified. Redirecting to dashboard...
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: colors.accent }}
            >
              Go to Dashboard <ArrowRight className="inline ml-2 w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#ef4444' }} />
            <h2 className={`text-2xl font-bold mb-2 ${colors.text}`}>Verification Failed</h2>
            <p className={`mb-6 ${colors.textSecondary}`}>{message}</p>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                  Resend Verification Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      colors.isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    style={{ color: colors.text }}
                  />
                  <button
                    onClick={handleResend}
                    className="px-4 py-2 rounded-lg font-semibold text-white flex items-center gap-2"
                    style={{ backgroundColor: colors.accent }}
                  >
                    <Mail className="w-4 h-4" />
                    Resend
                  </button>
                </div>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-3 rounded-lg font-semibold"
                style={{
                  backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: colors.text,
                }}
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;

