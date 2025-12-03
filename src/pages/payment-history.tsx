import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { toast } from '../utils/toast';
import { ArrowLeft, Download, Calendar, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { THEME_CONFIG, getGlassmorphismClass } from '../components/home/theme';
import Header from '../components/dashboard-components/Header';
import Sidebar from '../components/dashboard-components/Sidebar';

interface Payment {
  id: number;
  tier: string;
  billingPeriod: string;
  amount: number;
  status: string;
  last4Digits?: string;
  transactionId: string;
  createdAt: string;
  completedAt?: string;
}

const PaymentHistory: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const colors = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Check if we have stored user data from login
      const storedUserData = sessionStorage.getItem('userData');
      let userData = null;
      
      if (storedUserData) {
        try {
          userData = JSON.parse(storedUserData);
          console.log('[PaymentHistory] Using stored user data:', { id: userData.id, email: userData.email });
          setUser(userData);
        } catch (err) {
          console.error('[PaymentHistory] Failed to parse stored user data:', err);
          sessionStorage.removeItem('userData');
        }
      }
      
      try {
        const [paymentsRes, userRes] = await Promise.all([
          api.get('/payment/history').catch(err => {
            console.warn('[PaymentHistory] Failed to fetch payments:', err);
            return { data: { status: 'error' } };
          }),
          userData ? Promise.resolve({ data: { status: 'success', user: userData } }) : 
            api.get('/auth/me').catch(err => {
              console.warn('[PaymentHistory] Failed to fetch user:', err);
              return { data: { status: 'error' } };
            }),
        ]);

        if (paymentsRes.data?.status === 'success') {
          setPayments(paymentsRes.data.payments || []);
        }
        if (userRes.data?.status === 'success' && userRes.data.user) {
          setUser(userRes.data.user);
          // Clear stored data if we got fresh data from API
          if (storedUserData) {
            sessionStorage.removeItem('userData');
            sessionStorage.removeItem('justLoggedIn');
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
      
      // Verify session in background if we used stored data
      if (storedUserData && userData) {
        setTimeout(async () => {
          try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const res = await api.get('/auth/me');
            if (res.data?.status === 'success' && res.data?.user) {
              console.log('[PaymentHistory] Session verified, updating user data');
              setUser(res.data.user);
              sessionStorage.removeItem('userData');
              sessionStorage.removeItem('justLoggedIn');
            }
          } catch (err) {
            console.warn('[PaymentHistory] Background session verification failed, but using stored data');
          }
        }, 2000);
      }
    };

    fetchData();
  }, []);

  const handleDownloadInvoice = async (paymentId: number) => {
    try {
      const response = await api.get(`/payment/${paymentId}/invoice`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      // Create blob from response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to download invoice:', error);
      
      // Try to extract error message from response
      let errorMessage = 'Failed to download invoice. Please try again.';
      
      if (error.response) {
        // If response is a blob, try to read it as text
        if (error.response.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorMessage;
          } catch {
            // If parsing fails, use default message
          }
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <Header user={user} />
      <Sidebar
        isSidebarOpen={false}
        setIsSidebarOpen={() => {}}
        refreshKey={0}
        user={user}
      />
      <div className="md:ml-64 p-6 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className={`p-2 rounded-lg ${colors.text} hover:opacity-80 transition-opacity`}
              style={{ backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className={`text-3xl font-bold ${colors.text}`}>Payment History</h1>
          </div>

          {/* Current Subscription Info */}
          {user && user.subscriptionStatus && user.subscriptionStatus !== 'free' && (
            <div
              className={`${glassmorphismClass} p-6 mb-6 rounded-xl`}
              style={{
                backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                boxShadow: colors.cardShadow,
              }}
            >
              <h2 className={`text-xl font-semibold mb-4 ${colors.text}`}>Current Subscription</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className={`text-sm ${colors.textSecondary} mb-1`}>Plan</p>
                  <p className={`text-lg font-semibold ${colors.text}`}>
                    {user.pricingTier?.charAt(0).toUpperCase() + user.pricingTier?.slice(1)}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${colors.textSecondary} mb-1`}>Status</p>
                  <p className={`text-lg font-semibold ${colors.text}`}>
                    {user.subscriptionStatus?.charAt(0).toUpperCase() + user.subscriptionStatus?.slice(1)}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${colors.textSecondary} mb-1`}>Expires</p>
                  <p className={`text-lg font-semibold ${colors.text}`}>
                    {user.subscriptionExpiresAt
                      ? formatDate(user.subscriptionExpiresAt)
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payments List */}
          {loading ? (
            <div className={`text-center py-12 ${colors.text}`}>Loading...</div>
          ) : payments.length === 0 ? (
            <div
              className={`${glassmorphismClass} p-12 rounded-xl text-center`}
              style={{
                backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                boxShadow: colors.cardShadow,
              }}
            >
              <CreditCard className={`w-16 h-16 mx-auto mb-4 ${colors.textSecondary}`} />
              <p className={`text-lg ${colors.text}`}>No payment history found</p>
              <button
                onClick={() => navigate('/pricing')}
                className="mt-4 px-6 py-2 rounded-lg font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                }}
              >
                View Plans
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className={`${glassmorphismClass} p-6 rounded-xl`}
                  style={{
                    backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    boxShadow: colors.cardShadow,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(payment.status)}
                        <h3 className={`text-xl font-semibold ${colors.text}`}>
                          {payment.tier.charAt(0).toUpperCase() + payment.tier.slice(1)} Plan
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className={`text-sm ${colors.textSecondary} mb-1`}>Amount</p>
                          <p className={`text-lg font-semibold ${colors.text}`}>
                            ${parseFloat(payment.amount.toString()).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${colors.textSecondary} mb-1`}>Billing Period</p>
                          <p className={`text-lg font-semibold ${colors.text}`}>
                            {payment.billingPeriod === 'monthly' ? 'Monthly' : 'Annual'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${colors.textSecondary} mb-1`}>Date</p>
                          <p className={`text-lg font-semibold ${colors.text}`}>
                            {formatDate(payment.createdAt)}
                          </p>
                        </div>
                        {payment.last4Digits && (
                          <div>
                            <p className={`text-sm ${colors.textSecondary} mb-1`}>Card</p>
                            <p className={`text-lg font-semibold ${colors.text}`}>
                              **** {payment.last4Digits}
                            </p>
                          </div>
                        )}
                      </div>

                      {payment.transactionId && (
                        <p className={`text-sm mt-2 ${colors.textSecondary}`}>
                          Transaction ID: {payment.transactionId}
                        </p>
                      )}
                    </div>

                    {payment.status === 'completed' && (
                      <button
                        onClick={() => handleDownloadInvoice(payment.id)}
                        className={`ml-4 p-3 rounded-lg ${colors.text} hover:opacity-80 transition-opacity`}
                        style={{ backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                        title="Download Invoice"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;

