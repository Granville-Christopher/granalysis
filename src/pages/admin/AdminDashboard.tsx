import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  UserPlus,
  Activity,
  CreditCard,
} from 'lucide-react';
import api from '../../utils/axios';
import { THEME_CONFIG } from '../../components/home/theme';

const AdminOverview = lazy(() => import('./components/AdminOverview'));
const AdminUsers = lazy(() => import('./components/AdminUsers'));
const AdminFiles = lazy(() => import('./components/AdminFiles'));
const AdminSecurity = lazy(() => import('./components/AdminSecurity'));
const AdminAccountManagement = lazy(() => import('./components/AdminAccountManagement'));
const SupportTickets = lazy(() => import('./components/SupportTickets'));
const SupportUsers = lazy(() => import('./components/SupportUsers'));
const UserDetail = lazy(() => import('./components/UserDetail'));
const FileDetail = lazy(() => import('./components/FileDetail'));
const SecurityEventDetail = lazy(() => import('./components/SecurityEventDetail'));
const AdminAnalytics = lazy(() => import('./components/AdminAnalytics'));
const ActivityLogs = lazy(() => import('./components/ActivityLogs'));
const SystemHealth = lazy(() => import('./components/SystemHealth'));
const PaymentManagement = lazy(() => import('./components/PaymentManagement'));
const AdminSettings = lazy(() => import('./components/AdminSettings'));
const UserImpersonation = lazy(() => import('./components/UserImpersonation'));
const EmailTemplates = lazy(() => import('./components/EmailTemplates'));
const SystemConfiguration = lazy(() => import('./components/SystemConfiguration'));
const ChangePassword = lazy(() => import('./components/ChangePassword'));
const DatabaseBackup = lazy(() => import('./components/DatabaseBackup'));
const SessionManagement = lazy(() => import('./components/SessionManagement'));

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadTicketsCount, setUnreadTicketsCount] = useState(0);
  const colors = THEME_CONFIG.dark;

  // Fetch unread tickets count for admin
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/admin/support/tickets', {
        params: { limit: 1000 },
        withCredentials: true,
      });
      if (response.data?.status === 'success' && response.data.tickets) {
        // Calculate unread messages from users
        let unreadCount = 0;
        response.data.tickets.forEach((ticket: any) => {
          if (!ticket.messages || ticket.messages.length === 0) return;
          if (!ticket.readBy?.admin) {
            // If admin never read, count all user messages
            unreadCount += ticket.messages.filter((m: any) => m.senderType === 'user').length;
          } else {
            // Count messages after last read time
            const lastReadTime = new Date(ticket.readBy.admin).getTime();
            unreadCount += ticket.messages.filter((m: any) => 
              m.senderType === 'user' && new Date(m.createdAt).getTime() > lastReadTime
            ).length;
          }
        });
        setUnreadTicketsCount(unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Poll for unread counts
  useEffect(() => {
    if (!admin || (admin.role !== 'support_admin' && admin.role !== 'super_admin')) {
      return;
    }
    
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [admin]);

  useEffect(() => {
    // Only check admin auth if we're not already on the login/register pages
    if (location.pathname === '/admin/login' || 
        location.pathname === '/admin/super-admin/login' ||
        location.pathname === '/admin/super-admin/register') {
      setLoading(false);
      return;
    }

    // Check if we just logged in - use sessionStorage data immediately
    // Check for both regular admin and super admin
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const adminDataStr = sessionStorage.getItem('adminData');
    const superAdminLoggedIn = sessionStorage.getItem('superAdminLoggedIn');
    const superAdminDataStr = sessionStorage.getItem('superAdminData');
    
    // Handle super admin login
    if (superAdminLoggedIn === 'true' && superAdminDataStr) {
      try {
        const superAdminData = JSON.parse(superAdminDataStr);
        console.log('[AdminDashboard] Using sessionStorage super admin data:', superAdminData);
        // Normalize super admin data to match admin format
        // Ensure role is set for super admin
        const normalizedAdmin = {
          ...superAdminData,
          role: 'super_admin',
          email: superAdminData.email,
        };
        setAdmin(normalizedAdmin);
        setLoading(false);
        
        // Still verify with server in background (non-blocking)
        api.get('/admin/super-admin/me', { withCredentials: true })
          .then(response => {
            console.log('[AdminDashboard] Background super admin verification:', response.data);
            if (response.data?.status === 'success' && response.data?.superAdmin) {
              setAdmin(response.data.superAdmin);
              // Update sessionStorage with fresh data
              sessionStorage.setItem('superAdminData', JSON.stringify(response.data.superAdmin));
            }
          })
          .catch(err => {
            console.error('[AdminDashboard] Background super admin verification failed:', err);
            console.log('[AdminDashboard] Continuing with sessionStorage data despite verification failure');
            // Don't redirect if we have sessionStorage data - let user continue
            // The session might not be ready yet, but we have the login data
          });
        return; // Exit early - don't check auth again
      } catch (e) {
        console.error('[AdminDashboard] Error parsing super admin sessionStorage data:', e);
      }
    }
    
    // Handle regular admin login
    if (adminLoggedIn === 'true' && adminDataStr) {
      try {
        const adminData = JSON.parse(adminDataStr);
        console.log('[AdminDashboard] Using sessionStorage admin data:', adminData);
        setAdmin(adminData);
        setLoading(false);
        // Still verify with server in background
        api.get('/admin/auth/me', { withCredentials: true })
          .then(response => {
            console.log('[AdminDashboard] Background admin verification:', response.data);
            if (response.data?.status === 'success' && response.data?.admin) {
              setAdmin(response.data.admin);
              // Update sessionStorage with fresh data
              sessionStorage.setItem('adminData', JSON.stringify(response.data.admin));
            }
          })
          .catch(err => {
            console.error('[AdminDashboard] Background admin verification failed:', err);
            // Don't redirect if we have sessionStorage data - let user continue
          });
        return;
      } catch (e) {
        console.error('[AdminDashboard] Error parsing admin sessionStorage data:', e);
      }
    }

    // Check auth with server (will determine if super admin or regular admin)
    // Only do this if we don't have sessionStorage data
    const checkAdminAuth = async () => {
      try {
        console.log('[AdminDashboard] Checking admin auth...');
        
        // First try super admin endpoint
        try {
          const superAdminResponse = await api.get('/admin/super-admin/me', { withCredentials: true });
          console.log('[AdminDashboard] Super admin auth check response:', superAdminResponse.data);
          
          if (superAdminResponse.data?.status === 'success' && superAdminResponse.data?.superAdmin) {
            console.log('[AdminDashboard] Super admin authenticated:', superAdminResponse.data.superAdmin);
            setAdmin(superAdminResponse.data.superAdmin);
            // Update sessionStorage
            sessionStorage.setItem('superAdminLoggedIn', 'true');
            sessionStorage.setItem('superAdminData', JSON.stringify(superAdminResponse.data.superAdmin));
            setLoading(false);
            return;
          }
        } catch (superAdminError: any) {
          // If super admin check fails with 401/403 and we have super admin session storage, 
          // don't redirect immediately - the session might still be setting up
          if ((superAdminError.response?.status === 401 || superAdminError.response?.status === 403)) {
            if (superAdminLoggedIn === 'true' && superAdminDataStr) {
              console.log('[AdminDashboard] Super admin auth failed but we have sessionStorage - using it');
              // Don't redirect - use sessionStorage data instead
              try {
                const superAdminData = JSON.parse(superAdminDataStr);
                setAdmin({ ...superAdminData, role: 'super_admin' });
                setLoading(false);
                return; // Exit early - don't try regular admin
              } catch (e) {
                console.error('[AdminDashboard] Error parsing super admin data:', e);
              }
            }
            // Only redirect if we don't have sessionStorage data
            console.log('[AdminDashboard] Super admin auth failed and no sessionStorage, redirecting to super admin login');
            navigate('/admin/super-admin/login', { replace: true });
            setLoading(false);
            return;
          }
          // If super admin check fails for other reasons, try regular admin
          console.log('[AdminDashboard] Not a super admin, checking regular admin...');
        }
        
        // Try regular admin endpoint
        try {
          const response = await api.get('/admin/auth/me', { withCredentials: true });
          console.log('[AdminDashboard] Admin auth check response:', response.data);
          
          if (response.data?.status === 'success' && response.data?.admin) {
            console.log('[AdminDashboard] Admin authenticated:', response.data.admin);
            setAdmin(response.data.admin);
            // Update sessionStorage
            sessionStorage.setItem('adminLoggedIn', 'true');
            sessionStorage.setItem('adminData', JSON.stringify(response.data.admin));
            setLoading(false);
            return;
          }
        } catch (adminError: any) {
          // Regular admin also failed
          console.log('[AdminDashboard] Regular admin check also failed:', adminError.response?.data || adminError.message);
        }
        
        // Both checks failed - but check if we have sessionStorage data first
        if (superAdminLoggedIn === 'true' && superAdminDataStr) {
          console.log('[AdminDashboard] Auth check failed but we have super admin sessionStorage - using it');
          try {
            const superAdminData = JSON.parse(superAdminDataStr);
            setAdmin({ ...superAdminData, role: 'super_admin' });
            setLoading(false);
            return;
          } catch (e) {
            console.error('[AdminDashboard] Error parsing super admin data:', e);
          }
        }
        
        if (adminLoggedIn === 'true' && adminDataStr) {
          console.log('[AdminDashboard] Auth check failed but we have admin sessionStorage - using it');
          try {
            const adminData = JSON.parse(adminDataStr);
            setAdmin(adminData);
            setLoading(false);
            return;
          } catch (e) {
            console.error('[AdminDashboard] Error parsing admin data:', e);
          }
        }
        
        // Only redirect if we truly have no sessionStorage data
        // CRITICAL: Check sessionStorage FIRST before redirecting
        // This prevents redirecting when we have valid sessionStorage data but the API check failed
        if (superAdminLoggedIn === 'true' && superAdminDataStr) {
          console.log('[AdminDashboard] Using super admin sessionStorage data despite API failure');
          try {
            const superAdminData = JSON.parse(superAdminDataStr);
            setAdmin({ ...superAdminData, role: 'super_admin' });
            setLoading(false);
            return; // Don't redirect - use sessionStorage
          } catch (e) {
            console.error('[AdminDashboard] Error parsing super admin data:', e);
          }
        }
        
        if (adminLoggedIn === 'true' && adminDataStr) {
          console.log('[AdminDashboard] Using admin sessionStorage data despite API failure');
          try {
            const adminData = JSON.parse(adminDataStr);
            setAdmin(adminData);
            setLoading(false);
            return; // Don't redirect - use sessionStorage
          } catch (e) {
            console.error('[AdminDashboard] Error parsing admin data:', e);
          }
        }
        
        // Only redirect if we have NO sessionStorage data at all
        const isSuperAdminAttempt = superAdminLoggedIn === 'true' || superAdminDataStr;
        const loginPath = isSuperAdminAttempt ? '/admin/super-admin/login' : '/admin/login';
        console.log('[AdminDashboard] Auth check failed and no sessionStorage, redirecting to:', loginPath);
        navigate(loginPath, { replace: true });
      } catch (error: any) {
        console.error('[AdminDashboard] Auth check error:', error.response?.data || error.message);
        
        // Check if we have sessionStorage data before redirecting
        // CRITICAL: Always check sessionStorage FIRST - don't redirect if we have valid data
        if (superAdminLoggedIn === 'true' && superAdminDataStr) {
          console.log('[AdminDashboard] Auth error but we have super admin sessionStorage - using it');
          try {
            const superAdminData = JSON.parse(superAdminDataStr);
            setAdmin({ ...superAdminData, role: 'super_admin' });
            setLoading(false);
            return; // Don't redirect - use sessionStorage
          } catch (e) {
            console.error('[AdminDashboard] Error parsing super admin data:', e);
          }
        }
        
        if (adminLoggedIn === 'true' && adminDataStr) {
          console.log('[AdminDashboard] Auth error but we have admin sessionStorage - using it');
          try {
            const adminData = JSON.parse(adminDataStr);
            setAdmin(adminData);
            setLoading(false);
            return; // Don't redirect - use sessionStorage
          } catch (e) {
            console.error('[AdminDashboard] Error parsing admin data:', e);
          }
        }
        
        // Only redirect if it's a 401/403 and we don't have sessionStorage data
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Determine which login page based on session storage
          const isSuperAdminAttempt = superAdminLoggedIn === 'true' || superAdminDataStr;
          const loginPath = isSuperAdminAttempt ? '/admin/super-admin/login' : '/admin/login';
          console.log('[AdminDashboard] Auth error and no sessionStorage, redirecting to:', loginPath);
          navigate(loginPath, { replace: true });
        } else {
          // For other errors, check sessionStorage again before giving up
          if (superAdminLoggedIn === 'true' && superAdminDataStr) {
            try {
              const superAdminData = JSON.parse(superAdminDataStr);
              setAdmin({ ...superAdminData, role: 'super_admin' });
              setLoading(false);
              return;
            } catch (e) {
              console.error('[AdminDashboard] Error parsing super admin data:', e);
            }
          }
          if (adminLoggedIn === 'true' && adminDataStr) {
            try {
              const adminData = JSON.parse(adminDataStr);
              setAdmin(adminData);
              setLoading(false);
              return;
            } catch (e) {
              console.error('[AdminDashboard] Error parsing admin data:', e);
            }
          }
          // For other errors, show error but don't redirect
          console.error('[AdminDashboard] Non-auth error, keeping on page');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    const isSuperAdmin = admin?.email && !admin?.username;
    
    try {
      if (isSuperAdmin) {
        await api.post('/admin/super-admin/logout', {}, { withCredentials: true });
        sessionStorage.removeItem('superAdminLoggedIn');
        sessionStorage.removeItem('superAdminData');
        navigate('/admin/super-admin/login', { replace: true });
      } else {
        await api.post('/admin/auth/logout', {}, { withCredentials: true });
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminData');
        navigate('/admin/login', { replace: true });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Clear sessionStorage anyway
      sessionStorage.removeItem('adminLoggedIn');
      sessionStorage.removeItem('adminData');
      sessionStorage.removeItem('superAdminLoggedIn');
      sessionStorage.removeItem('superAdminData');
      navigate(isSuperAdmin ? '/admin/super-admin/login' : '/admin/login', { replace: true });
    }
  };

  // If we're on the login/register pages, don't render the dashboard
  // This prevents the dashboard from rendering when routes like /admin/super-admin/login are matched by /admin/*
  if (location.pathname === '/admin/login' || 
      location.pathname === '/admin/super-admin/login' ||
      location.pathname === '/admin/super-admin/register') {
    return null; // Let the specific route component handle it
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0B1B3B 0%, #1A345B 50%, #0B1B3B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: colors.accent, fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const getMenuItems = () => {
    // Determine role - check both email (super admin) and role field
    const isSuperAdmin = admin?.email && !admin?.username && (admin?.role === 'super_admin' || admin?.email);
    const role = admin?.role || (isSuperAdmin ? 'super_admin' : 'admin');
    
    const baseItems = [
      { path: '/admin', icon: LayoutDashboard, label: 'Overview' },
      { path: '/admin/users', icon: Users, label: 'Users' },
      { path: '/admin/files', icon: FileText, label: 'Files' },
      { path: '/admin/security', icon: Shield, label: 'Security' },
      { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
      { path: '/admin/activity-logs', icon: Settings, label: 'Activity Logs' },
      { path: '/admin/system-health', icon: Activity, label: 'System Health' },
      { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
      { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ];

      // Super admin only items
      if (role === 'super_admin' || isSuperAdmin) {
        return [
          ...baseItems,
          { path: '/admin/accounts', icon: UserPlus, label: 'Admin Accounts', badge: 'Super Admin' },
          { path: '/admin/email-templates', icon: Settings, label: 'Email Templates', badge: 'Super Admin' },
          { path: '/admin/system-config', icon: Settings, label: 'System Config', badge: 'Super Admin' },
          { path: '/admin/backup', icon: Settings, label: 'Database Backup', badge: 'Super Admin' },
          { path: '/admin/sessions', icon: Shield, label: 'Session Management', badge: 'Super Admin' },
          { path: '/admin/change-password', icon: Settings, label: 'Change Password' },
        ];
      }

    // Support admin items
    if (role === 'support_admin') {
      return [
        ...baseItems,
        { path: '/admin/support/tickets', icon: FileText, label: 'Support Tickets', badge: 'Support' },
        { path: '/admin/support/users', icon: Users, label: 'Support Users', badge: 'Support' },
        { path: '/admin/impersonate', icon: UserPlus, label: 'Impersonate User', badge: 'Support' },
        { path: '/admin/change-password', icon: Settings, label: 'Change Password' },
      ];
    }

    // Regular admin items
    return [
      ...baseItems,
      { path: '/admin/change-password', icon: Settings, label: 'Change Password' },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0B1B3B 0%, #1A345B 50%, #0B1B3B 100%)',
        display: 'flex',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? '260px' : '0',
          background: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          transition: 'width 0.3s',
          overflow: 'hidden',
          position: 'fixed',
          height: '100vh',
          zIndex: 1000,
        }}
      >
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
            <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold' }}>Admin Panel</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.text,
                cursor: 'pointer',
                display: sidebarOpen ? 'block' : 'none',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                               (item.path === '/admin' && location.pathname === '/admin') ||
                               (location.pathname.startsWith(item.path) && item.path !== '/admin');
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: isActive
                      ? `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`
                      : 'transparent',
                    color: isActive ? 'white' : colors.text,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '400',
                    transition: 'all 0.2s',
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  <Icon size={18} />
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                  {item.path === '/admin/support/tickets' && unreadTicketsCount > 0 && (
                    <div
                      style={{
                        background: isActive ? 'rgba(255, 255, 255, 0.3)' : '#ef4444',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        minWidth: '20px',
                        textAlign: 'center',
                      }}
                    >
                      {unreadTicketsCount > 99 ? '99+' : unreadTicketsCount}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? '260px' : '0',
          transition: 'margin-left 0.3s',
          padding: '20px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '30px',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.text,
              cursor: 'pointer',
              display: !sidebarOpen ? 'block' : 'none',
            }}
          >
            <Menu size={24} />
          </button>
          <div style={{ color: colors.text, fontSize: '14px' }}>
            Welcome, <strong>{admin.email || admin.username}</strong>
          </div>
        </div>

        {/* Routes */}
        <Suspense
          fallback={
            <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>
          }
        >
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/files" element={<AdminFiles />} />
            <Route path="/files/:id" element={<FileDetail />} />
            <Route path="/security" element={<AdminSecurity />} />
            <Route path="/security/events/:id" element={<SecurityEventDetail />} />
            <Route path="/accounts" element={<AdminAccountManagement />} />
            <Route path="/support/tickets" element={<SupportTickets />} />
            <Route path="/support/users" element={<SupportUsers />} />
            <Route path="/analytics" element={<AdminAnalytics />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
            <Route path="/system-health" element={<SystemHealth />} />
            <Route path="/payments" element={<PaymentManagement />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/impersonate" element={<UserImpersonation />} />
            <Route path="/email-templates" element={<EmailTemplates />} />
            <Route path="/system-config" element={<SystemConfiguration />} />
            <Route path="/backup" element={<DatabaseBackup />} />
            <Route path="/sessions" element={<SessionManagement />} />
            <Route path="/change-password" element={<ChangePassword isSuperAdmin={admin?.role === 'super_admin' || (admin?.email && !admin?.username)} />} />
            <Route path="*" element={<AdminOverview />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default AdminDashboard;

