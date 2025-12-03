import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG, ThemeConfig } from '../../../components/home/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from '../../../utils/toast';

const PaymentManagement: React.FC = () => {
  const { isDark } = useTheme();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 50 };
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/admin/payments', {
        params,
        withCredentials: true,
      });
      if (response.data) {
        setPayments(response.data.payments || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color="#10b981" />;
      case 'failed':
        return <XCircle size={16} color="#ef4444" />;
      case 'pending':
        return <Clock size={16} color="#f59e0b" />;
      default:
        return <Clock size={16} color={colors.textSecondary} />;
    }
  };

  if (loading && payments.length === 0) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
        Payment Management
      </h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            color: colors.text,
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            All Statuses
          </option>
          <option value="pending" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Pending
          </option>
          <option value="completed" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Completed
          </option>
          <option value="failed" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Failed
          </option>
          <option value="refunded" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Refunded
          </option>
        </select>
      </div>

      <div
        style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        {payments.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>User ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Tier</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    style={{
                      borderBottom: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                    }}
                  >
                    <td style={{ padding: '12px', color: colors.text, fontSize: '14px' }}>{payment.userId}</td>
                    <td style={{ padding: '12px', color: colors.text, fontSize: '14px' }}>{payment.tier}</td>
                    <td style={{ padding: '12px', color: colors.text, fontSize: '14px' }}>
                      ${payment.amount}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {getStatusIcon(payment.status)}
                        <span style={{ color: colors.text, fontSize: '14px' }}>{payment.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: colors.text, fontSize: '14px' }}>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: colors.textSecondary, textAlign: 'center', padding: '40px' }}>
            No payments found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: page === 1 ? 'transparent' : colors.accent,
              color: page === 1 ? colors.textSecondary : 'white',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Previous
          </button>
          <span style={{ color: colors.text, fontSize: '14px' }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: page === totalPages ? 'transparent' : colors.accent,
              color: page === totalPages ? colors.textSecondary : 'white',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;

