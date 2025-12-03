import React, { useState, useEffect } from 'react';
import { Settings, Save, Bell, Shield, Globe, CheckCircle, XCircle } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG, ThemeConfig } from '../../../components/home/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from '../../../utils/toast';

const AdminSettings: React.FC = () => {
  const { isDark } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    securityAlerts: true,
    systemMaintenance: false,
    autoBackup: true,
    sessionTimeout: 30,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const response = await api.get('/admin/settings', { withCredentials: true });
      if (response.data?.status === 'success' && response.data?.data) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // Use defaults if fetch fails
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setShowSuccessModal(false);
      setShowErrorModal(false);
      
      // Call backend API to save settings
      const response = await api.post('/admin/settings', settings, { withCredentials: true });
      
      if (response.data?.status === 'success') {
        setShowSuccessModal(true);
        // Auto-close success modal after 2 seconds
        setTimeout(() => setShowSuccessModal(false), 2000);
      } else {
        setErrorMessage(response.data?.message || 'Failed to save settings');
        setShowErrorModal(true);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save settings';
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
        Admin Settings
      </h1>

      <div
        style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
          Notification Preferences
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: colors.text, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
              style={{ cursor: 'pointer' }}
            />
            <Bell size={18} />
            <span>Email Notifications</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: colors.text, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.securityAlerts}
              onChange={(e) => setSettings({ ...settings, securityAlerts: e.target.checked })}
              style={{ cursor: 'pointer' }}
            />
            <Shield size={18} />
            <span>Security Alerts</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: colors.text, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.systemMaintenance}
              onChange={(e) => setSettings({ ...settings, systemMaintenance: e.target.checked })}
              style={{ cursor: 'pointer' }}
            />
            <Globe size={18} />
            <span>System Maintenance Notifications</span>
          </label>
        </div>

        <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginTop: '30px', marginBottom: '20px' }}>
          System Preferences
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: colors.text, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.autoBackup}
              onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
              style={{ cursor: 'pointer' }}
            />
            <span>Auto Backup</span>
          </label>
          <div>
            <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 30 })}
              min="5"
              max="120"
              style={{
                width: '200px',
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                color: colors.text,
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            marginTop: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '8px',
            background: colors.accent,
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Save size={18} />
          Save Settings
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            style={{
              background: colors.isDark ? '#1a1a2e' : '#ffffff',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '400px',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <CheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
              Success!
            </h2>
            <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '20px' }}>
              Settings saved successfully!
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                background: colors.accent,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowErrorModal(false)}
        >
          <div
            style={{
              background: colors.isDark ? '#1a1a2e' : '#ffffff',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '400px',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <XCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
              Error
            </h2>
            <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '20px' }}>
              {errorMessage}
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;

