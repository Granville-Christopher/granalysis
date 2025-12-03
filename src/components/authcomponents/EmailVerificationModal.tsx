import React, { useState } from 'react';
import { Mail, CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../../utils/axios';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, getGlassmorphismClass } from '../home/theme';

interface EmailVerificationModalProps {
  email: string;
  onVerified: () => void;
  onResend: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ email, onVerified, onResend }) => {
  const { isDark } = useTheme();
  const colors = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [verificationToken, setVerificationToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!verificationToken.trim()) {
      setError('Please enter the verification token from your email');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/auth/verify-email', { token: verificationToken.trim() });
      if (res.data?.status === 'success') {
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          onVerified();
        }, 1000);
      } else {
        setError(res.data?.message || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please check your token.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/auth/resend-verification', { email });
      if (res.data?.status === 'success') {
        setSuccess('Verification email sent! Please check your inbox.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.data?.message || 'Failed to resend verification email');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`${glassmorphismClass} rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl ${colors.glassBorder} border`}>
        <div className="flex flex-col items-center mb-6">
          <div className={`p-4 rounded-full ${colors.isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <Mail className={`w-8 h-8 ${colors.isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <h2 className={`text-2xl font-bold mt-4 ${colors.text}`}>Verify Your Email</h2>
          <p className={`text-sm mt-2 text-center ${colors.textSecondary}`}>
            We've sent a verification link to <strong>{email}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
              Verification Token
            </label>
            <input
              type="text"
              value={verificationToken}
              onChange={(e) => setVerificationToken(e.target.value)}
              placeholder="Paste the token from your email"
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                colors.isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              style={{ color: colors.text }}
              disabled={loading}
            />
            <p className={`text-xs mt-1 ${colors.textSecondary}`}>
              Or click the link in your email to verify automatically
            </p>
          </div>

          {error && (
            <div className={`p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2`}>
              <XCircle className="w-4 h-4 text-red-500" />
              <p className={`text-sm ${colors.text}`}>{error}</p>
            </div>
          )}

          {success && (
            <div className={`p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2`}>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className={`text-sm ${colors.text}`}>{success}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleVerify}
              disabled={loading || !verificationToken.trim()}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                loading || !verificationToken.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </button>
            <button
              onClick={handleResend}
              disabled={resending}
              className={`px-4 py-3 rounded-lg font-medium transition-all border ${
                resending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : `${colors.glassBorder} ${colors.text} hover:bg-opacity-10`
              }`}
            >
              {resending ? (
                <span className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Resend'
              )}
            </button>
          </div>

          <button
            onClick={onVerified}
            className={`w-full text-sm text-center ${colors.textSecondary} hover:${colors.text} transition-colors`}
          >
            Skip for now (verify later)
          </button>
        </div>
      </div>
    </div>
  );
};

