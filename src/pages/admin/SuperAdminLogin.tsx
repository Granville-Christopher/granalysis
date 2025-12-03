import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import api from '../../utils/axios';
import { THEME_CONFIG } from '../../components/home/theme';
import { toast } from '../../utils/toast';

const SuperAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const colors = THEME_CONFIG.dark;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/admin/super-admin/login', { email, password }, { withCredentials: true });

      console.log('[SuperAdminLogin] Login response:', response.data);

            if (response.data?.status === 'success') {
              sessionStorage.setItem('superAdminLoggedIn', 'true');
              sessionStorage.setItem('superAdminData', JSON.stringify(response.data.superAdmin));
              toast.success('Super admin login successful!');
              setTimeout(() => {
                // Navigate to admin dashboard - it will detect super admin from sessionStorage
                navigate('/admin', { replace: true });
              }, 500);
      } else {
        setError(response.data?.message || 'Login failed');
      }
    } catch (err: any) {
      let errorMessage = 'Login failed. Please try again.';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      console.error('[SuperAdminLogin] Login error:', {
        status: err.response?.status,
        message: errorMessage,
        email: email,
        fullError: err.response?.data,
      });
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0B1B3B 0%, #1A345B 50%, #0B1B3B 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Lock size={30} color="white" />
          </div>
          <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
            Super Admin Portal
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '14px' }}>
            Sign in to access the super admin dashboard
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} color="#ef4444" />
            <span style={{ color: '#ef4444', fontSize: '14px' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                color: colors.text,
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textSecondary,
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  color: colors.text,
                  fontSize: '14px',
                  outline: 'none',
                }}
                placeholder="superadmin@example.com"
              />
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label
              style={{
                display: 'block',
                color: colors.text,
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textSecondary,
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  color: colors.text,
                  fontSize: '14px',
                  outline: 'none',
                }}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              background: loading
                ? 'rgba(79, 163, 255, 0.5)'
                : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: loading ? 'none' : `0 4px 15px ${colors.accent}40`,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
          }}
        >
          <button
            onClick={() => navigate('/admin/super-admin/register')}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.accent,
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Need an account? Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;

