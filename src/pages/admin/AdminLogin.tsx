import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';
import api from '../../utils/axios';
import { THEME_CONFIG } from '../../components/home/theme';
import { toast } from '../../utils/toast';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const colors = THEME_CONFIG.dark;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/admin/auth/login', { username, password }, { withCredentials: true });
      
      console.log('[AdminLogin] Login response:', response.data);
      
      if (response.data?.status === 'success') {
        console.log('[AdminLogin] Login successful, setting session and navigating...');
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminData', JSON.stringify(response.data.admin));
        toast.success('Admin login successful!');
        
        // Small delay to ensure session is set
        setTimeout(() => {
          console.log('[AdminLogin] Navigating to /admin');
          navigate('/admin', { replace: true });
        }, 500);
      } else {
        console.error('[AdminLogin] Login failed - unexpected response:', response.data);
        setError(response.data?.message || 'Login failed');
      }
    } catch (err: any) {
      // Extract error message from response
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('[AdminLogin] Login error:', {
        status: err.response?.status,
        message: errorMessage,
        username: username,
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
            Admin Portal
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '14px' }}>
            Sign in with your admin username
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
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User
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
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                placeholder="Enter your username"
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
            padding: '15px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <p style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', margin: 0 }}>
            ⚠️ This is a restricted area. Only authorized administrators can access this portal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

