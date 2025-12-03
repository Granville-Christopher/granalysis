import React, { useState, useEffect } from 'react';
import { Settings, Save, ToggleLeft, ToggleRight, Globe, Shield, Database, CheckCircle, XCircle } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG, ThemeConfig } from '../../../components/home/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from '../../../utils/toast';

const SystemConfiguration: React.FC = () => {
  const { isDark } = useTheme();
  const [config, setConfig] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    twoFactorRequired: false,
    rateLimitEnabled: true,
    maxFileSize: 10,
    allowedFileTypes: 'csv,xlsx,json,sql',
    notifyUsersBeforeMaintenance: false,
    notifyUsersBeforeMaintenanceMessage: '',
    maintenanceMessage: 'The system is currently under maintenance. Please check back later.',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setFetching(true);
      const response = await api.get('/admin/system-config', { withCredentials: true });
      if (response.data?.status === 'success' && response.data?.data) {
        setConfig(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch system config:', error);
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
      
      // Call backend API to save configuration
      const response = await api.post('/admin/system-config', config, { withCredentials: true });
      
      if (response.data?.status === 'success') {
        setShowSuccessModal(true);
        // Auto-close success modal after 2 seconds
        setTimeout(() => setShowSuccessModal(false), 2000);
      } else {
        setErrorMessage(response.data?.message || 'Failed to save configuration');
        setShowErrorModal(true);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save configuration';
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const ToggleSwitch = ({ enabled, onChange, label }: { enabled: boolean; onChange: (val: boolean) => void; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
      <span style={{ color: colors.text, fontSize: '14px' }}>{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        style={{
          width: '48px',
          height: '24px',
          borderRadius: '12px',
          background: enabled ? colors.accent : colors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'white',
            position: 'absolute',
            top: '2px',
            left: enabled ? '26px' : '2px',
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  );

  if (fetching) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
        System Configuration
      </h1>

      <div
        style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={20} />
          General Settings
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <ToggleSwitch
            enabled={config.maintenanceMode}
            onChange={(val) => setConfig({ ...config, maintenanceMode: val })}
            label="Maintenance Mode"
          />
          <ToggleSwitch
            enabled={config.notifyUsersBeforeMaintenance}
            onChange={(val) => setConfig({ ...config, notifyUsersBeforeMaintenance: val })}
            label="Notify Users Before Maintenance"
          />
          <ToggleSwitch
            enabled={config.registrationEnabled}
            onChange={(val) => setConfig({ ...config, registrationEnabled: val })}
            label="Registration Enabled"
          />
        </div>
        
        {config.notifyUsersBeforeMaintenance && (
          <div style={{ marginTop: '20px' }}>
            <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
              Pre-Maintenance Notification Message
            </label>
            <textarea
              value={config.notifyUsersBeforeMaintenanceMessage || ''}
              onChange={(e) => setConfig({ ...config, notifyUsersBeforeMaintenanceMessage: e.target.value })}
              rows={4}
              placeholder="Enter notification message with time/date. This will be sent to all users when the toggle is enabled..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                color: colors.text,
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
              }}
            />
            <p style={{ color: colors.textSecondary, fontSize: '12px', marginTop: '8px' }}>
              This message will be sent to all users via email when you enable this toggle. Include the specific date and time for the maintenance.
            </p>
          </div>
        )}
        
        {config.maintenanceMode && (
          <div style={{ marginTop: '20px' }}>
            <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
              Maintenance Message
            </label>
            <textarea
              value={config.maintenanceMessage || ''}
              onChange={(e) => setConfig({ ...config, maintenanceMessage: e.target.value })}
              rows={3}
              placeholder="Enter maintenance message to display to users..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                color: colors.text,
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>
        )}

        <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginTop: '30px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={20} />
          Security Settings
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <ToggleSwitch
            enabled={config.emailVerificationRequired}
            onChange={(val) => setConfig({ ...config, emailVerificationRequired: val })}
            label="Email Verification Required"
          />
          <ToggleSwitch
            enabled={config.twoFactorRequired}
            onChange={(val) => setConfig({ ...config, twoFactorRequired: val })}
            label="Two-Factor Authentication Required"
          />
          <ToggleSwitch
            enabled={config.rateLimitEnabled}
            onChange={(val) => setConfig({ ...config, rateLimitEnabled: val })}
            label="Rate Limiting Enabled"
          />
        </div>

        <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginTop: '30px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={20} />
          File Settings
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
              Max File Size (MB)
            </label>
            <input
              type="number"
              value={config.maxFileSize}
              onChange={(e) => setConfig({ ...config, maxFileSize: parseInt(e.target.value) || 10 })}
              min="1"
              max="100"
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
          <div>
            <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
              Allowed File Types (comma-separated)
            </label>
            <input
              type="text"
              value={config.allowedFileTypes}
              onChange={(e) => setConfig({ ...config, allowedFileTypes: e.target.value })}
              style={{
                width: '100%',
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
          Save Configuration
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
              System configuration saved successfully!
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

export default SystemConfiguration;

