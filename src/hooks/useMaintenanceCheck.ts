import { useState, useEffect } from 'react';
import api from '../utils/axios';

interface MaintenanceStatus {
  maintenanceMode: boolean;
  message: string;
}

export const useMaintenanceCheck = () => {
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus>({
    maintenanceMode: false,
    message: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        // Skip maintenance check for admin routes
        if (window.location.pathname.startsWith('/admin')) {
          setMaintenanceStatus({ maintenanceMode: false, message: '' });
          setLoading(false);
          return;
        }

        const response = await api.get('/maintenance/status', { withCredentials: true });
        if (response.data?.status === 'success') {
          setMaintenanceStatus({
            maintenanceMode: response.data.maintenanceMode || false,
            message: response.data.message || '',
          });
        }
      } catch (error) {
        console.error('Failed to check maintenance status:', error);
        // Default to no maintenance on error
        setMaintenanceStatus({ maintenanceMode: false, message: '' });
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
    // Check every 30 seconds
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, []);

  return { maintenanceStatus, loading };
};

