import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, MapPin, Clock, User } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG } from '../../../components/home/theme';
import { toast } from '../../../utils/toast';

const SecurityEventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const colors = THEME_CONFIG.dark;

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/security/events/${id}`, { withCredentials: true });
      if (response.data) {
        setEvent(response.data.event);
      }
    } catch (error) {
      console.error('Failed to fetch security event:', error);
      toast.error('Failed to load security event details');
    } finally {
      setLoading(false);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#eab308';
      default:
        return '#10b981';
    }
  };

  if (loading) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  if (!event) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Security event not found</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
        <button
          onClick={() => navigate('/admin/security')}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold' }}>
          Security Event Details
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div
          style={{
            background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${getThreatColor(event.threatLevel)}40`,
          }}
        >
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            Event Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                Event Type
              </label>
              <div style={{ color: colors.text, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} />
                {event.eventType}
              </div>
            </div>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                Threat Level
              </label>
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  background: `${getThreatColor(event.threatLevel)}20`,
                  color: getThreatColor(event.threatLevel),
                  fontSize: '12px',
                  fontWeight: '500',
                }}
              >
                {event.threatLevel}
              </div>
            </div>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                Description
              </label>
              <div style={{ color: colors.text, fontSize: '14px' }}>{event.description}</div>
            </div>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                Timestamp
              </label>
              <div style={{ color: colors.text, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} />
                {new Date(event.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          }}
        >
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            Context
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {event.userId && (
              <div>
                <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                  User ID
                </label>
                <div style={{ color: colors.text, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} />
                  {event.userId}
                </div>
              </div>
            )}
            {event.ipAddress && (
              <div>
                <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                  IP Address
                </label>
                <div style={{ color: colors.text, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} />
                  {event.ipAddress}
                </div>
              </div>
            )}
            {event.endpoint && (
              <div>
                <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                  Endpoint
                </label>
                <div style={{ color: colors.text, fontSize: '14px' }}>{event.endpoint}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityEventDetail;

