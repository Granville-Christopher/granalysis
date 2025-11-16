import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, CheckCircle, XCircle } from 'lucide-react';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../components/home/theme';
import { pricingData } from '../components/home/data';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/home/ui/Button';
import api from '../utils/axios';

interface PaymentFormData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  billingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const PaymentPage: React.FC = () => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedTierParam = searchParams.get('tier') || 'startup';
  const annualParam = searchParams.get('annual') === 'true';
  
  const [annual, setAnnual] = useState(annualParam);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [prorationInfo, setProrationInfo] = useState<{
    proratedCredit?: number;
    downgradeBalance?: number;
    originalAmount?: number;
    finalAmount?: number;
  } | null>(null);
  
  const glassmorphismClass = getGlassmorphismClass(colors);
  const accentColor = colors.accent;

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me', { withCredentials: true });
        if (res.data?.status === 'success') {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Find selected tier
  const selectedTier = pricingData.find(t => {
    const tierMap: Record<string, string> = {
      'free': 'Free Tier',
      'startup': 'Startup',
      'business': 'Business',
      'enterprise': 'Enterprise',
    };
    return t.title === tierMap[selectedTierParam];
  }) || pricingData[1]; // Default to Startup

  const computePrices = useMemo(() => {
    return (base: number) => {
      const monthlyPrice = base;
      const annualPrice = Math.round(base * 12 * 0.85); // 15% off yearly
      return { monthlyPrice, annualPrice };
    };
  }, []);

  const { monthlyPrice, annualPrice } = computePrices(selectedTier.price);
  const finalPrice = annual 
    ? annualPrice 
    : (selectedTier.price > 0 && !annual ? Math.round(monthlyPrice * 0.5) : monthlyPrice);

  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    cardHolder: user?.fullName || '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  // Update card holder when user loads
  useEffect(() => {
    if (user?.fullName) {
      setFormData(prev => ({ ...prev, cardHolder: user.fullName }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Format card number (add spaces every 4 digits)
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formatted.length <= 19) { // Max 16 digits + 3 spaces
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }
    
    // Format expiry date (MM/YY)
    if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    // Format CVV (max 4 digits)
    if (name === 'cvv') {
      const formatted = value.replace(/\D/g, '').substring(0, 4);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      // Validate form
      if (!formData.cardNumber || !formData.cardHolder || !formData.expiryDate || !formData.cvv) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.cardNumber.replace(/\s/g, '').length < 13) {
        throw new Error('Please enter a valid card number');
      }

      if (formData.cvv.length < 3) {
        throw new Error('Please enter a valid CVV');
      }

      // Submit payment to backend
      const paymentData = {
        tier: selectedTierParam,
        billingPeriod: annual ? 'annual' : 'monthly',
        amount: finalPrice,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        cardHolder: formData.cardHolder,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        billingAddress: formData.billingAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      };

      const response = await api.post('/payment/process', paymentData, { withCredentials: true });
      
      if (response.data?.status === 'success') {
        const payment = response.data.payment;
        
        // Store proration info for display
        if (payment.proratedCredit > 0 || payment.downgradeBalance > 0) {
          setProrationInfo({
            proratedCredit: payment.proratedCredit || 0,
            downgradeBalance: payment.downgradeBalance || 0,
            originalAmount: payment.originalAmount || payment.amount,
            finalAmount: payment.amount
          });
        }
        
        // Show proration details if applicable
        if (payment.proratedCredit > 0) {
          console.log('[Payment] Proration applied:', {
            originalAmount: payment.originalAmount,
            proratedCredit: payment.proratedCredit,
            finalAmount: payment.amount
          });
        }
        
        // Show downgrade balance if applicable
        if (payment.downgradeBalance > 0) {
          console.log('[Payment] Downgrade balance:', payment.downgradeBalance);
        }
        
        // Immediately refresh user data from database
        try {
          // Wait a bit for database to be updated
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Fetch fresh user data directly from database
          const userRes = await api.get('/auth/me', { withCredentials: true });
          if (userRes.data?.status === 'success') {
            const updatedUser = userRes.data.user;
            setUser(updatedUser);
            console.log('[Payment] Fresh user data fetched:', { 
              pricingTier: updatedUser.pricingTier,
              accountBalance: updatedUser.accountBalance,
              subscriptionExpiresAt: updatedUser.subscriptionExpiresAt
            });
            
            // Update sessionStorage with fresh user data
            sessionStorage.setItem('userData', JSON.stringify(updatedUser));
            sessionStorage.setItem('justLoggedIn', 'true');
            console.log('[Payment] Updated sessionStorage with fresh user data');
          }
        } catch (err) {
          console.error('[Payment] Failed to refresh user data:', err);
          // Clear old stored data even if refresh fails
          sessionStorage.removeItem('userData');
          sessionStorage.removeItem('justLoggedIn');
        }
        
        setSuccess(true);
        setTimeout(() => {
          // Force a hard reload to ensure dashboard gets fresh data
          window.location.href = '/dashboard';
        }, 3000);
      } else {
        throw new Error(response.data?.message || 'Payment processing failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Background style matching signup page
  const backgroundStyle = colors.isDark
    ? `radial-gradient(ellipse at center, #1A345B 0%, ${colors.bg} 100%)`
    : `linear-gradient(180deg, #F9FAFB 0%, ${colors.bg} 100%)`;

  const networkGlow = colors.isDark ? '#4FA3FF' : '#1D4ED8';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: backgroundStyle }}>
        <div className={`text-xl ${colors.text}`}>Loading...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: backgroundStyle }}>
        <div className={`${glassmorphismClass} p-12 rounded-2xl text-center max-w-md`}>
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h2 className={`text-2xl font-bold mb-4 ${colors.text}`}>Payment Successful!</h2>
          
          {prorationInfo && (
            <div className={`mb-4 p-4 rounded-lg text-left ${colors.isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
              {prorationInfo.proratedCredit && prorationInfo.proratedCredit > 0 && (
                <div className="mb-2">
                  <p className={`text-sm ${colors.textSecondary}`}>Original Amount:</p>
                  <p className={`text-lg font-semibold ${colors.text}`}>
                    ${prorationInfo.originalAmount?.toLocaleString()}
                  </p>
                  <p className={`text-sm text-green-500`}>
                    Prorated Credit: -${prorationInfo.proratedCredit.toLocaleString()}
                  </p>
                  <p className={`text-sm ${colors.textSecondary} mt-1`}>
                    Final Amount: ${prorationInfo.finalAmount?.toLocaleString()}
                  </p>
                </div>
              )}
              {prorationInfo.downgradeBalance && prorationInfo.downgradeBalance > 0 && (
                <div>
                  <p className={`text-sm ${colors.textSecondary}`}>Account Balance:</p>
                  <p className={`text-lg font-semibold text-green-500`}>
                    ${prorationInfo.downgradeBalance.toLocaleString()}
                  </p>
                  <p className={`text-xs ${colors.textSecondary} mt-1`}>
                    Credit from downgrade. Contact admin for refund.
                  </p>
                </div>
              )}
            </div>
          )}
          
          <p className={colors.textSecondary}>Your subscription has been activated. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen transition-colors duration-300 py-12"
      style={{
        background: backgroundStyle,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.3)' : 'rgba(29, 78, 216, 0.2)',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 3 + 2 + 's',
            }}
          />
        ))}
      </div>

      {/* Network pattern overlay */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${networkGlow} 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/pricing')}
            className={`inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-colors ${
              colors.isDark
                ? 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Pricing</span>
          </button>
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${colors.text}`}>
            Complete Your Payment
          </h1>
          <p className={`text-lg ${colors.textSecondary} mb-6`}>
            Upgrade to {selectedTier.title} Plan
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${annual ? colors.textSecondary : colors.text} font-medium`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                annual
                  ? colors.isDark
                    ? 'bg-blue-600'
                    : 'bg-blue-500'
                  : colors.isDark
                  ? 'bg-gray-700'
                  : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${
                  annual ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${annual ? colors.text : colors.textSecondary} font-medium`}>
              Yearly
            </span>
            {annual && (
              <span className="px-2 py-1 rounded text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500">
                Save 15%
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`${glassmorphismClass} p-6 rounded-2xl sticky top-8`}>
              <h3 className={`text-xl font-bold mb-4 ${colors.text}`}>Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className={colors.textSecondary}>Plan:</span>
                  <span className={colors.text}>{selectedTier.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className={colors.textSecondary}>Billing:</span>
                  <span className={colors.text}>{annual ? 'Annual' : 'Monthly'}</span>
                </div>
                {!annual && selectedTier.price > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>First Month Discount:</span>
                    <span>-50%</span>
                  </div>
                )}
                {annual && (
                  <div className="flex justify-between text-blue-500">
                    <span>Annual Discount:</span>
                    <span>-15%</span>
                  </div>
                )}
                {/* Proration info will be shown after payment processing */}
                <div className="border-t pt-4 flex justify-between">
                  <span className={`text-lg font-bold ${colors.text}`}>Total:</span>
                  <span className={`text-2xl font-bold ${colors.text}`}>
                    ${finalPrice.toLocaleString()}
                    <span className="text-sm ml-1">{annual ? '/year' : '/month'}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-green-500 mb-4">
                <Lock className="w-4 h-4" />
                <span>Secure payment encrypted</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className={`${glassmorphismClass} p-8 rounded-2xl`}>
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-500">{error}</span>
                </div>
              )}

              <h3 className={`text-2xl font-bold mb-6 ${colors.text}`}>Payment Details</h3>

              {/* Card Number */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                  Card Number *
                </label>
                <div className="relative">
                  <CreditCard className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${colors.textSecondary}`} />
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                    className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                      colors.isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              {/* Card Holder */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                  Card Holder Name *
                </label>
                <input
                  type="text"
                  name="cardHolder"
                  value={formData.cardHolder}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${
                    colors.isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                    Expiry Date *
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      colors.isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                    CVV *
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength={4}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      colors.isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              {/* Billing Address */}
              <h4 className={`text-lg font-semibold mb-4 ${colors.text}`}>Billing Address</h4>
              
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                  Address *
                </label>
                <input
                  type="text"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleInputChange}
                  placeholder="123 Main St"
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${
                    colors.isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      colors.isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      colors.isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      colors.isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                    Country *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      colors.isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={processing}
                    className={`w-full mt-6 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                      processing
                        ? 'opacity-50 cursor-not-allowed'
                        : colors.isDark
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400'
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                    }`}
                    style={{
                      boxShadow: processing ? 'none' : `0 4px 15px ${accentColor}40`,
                    }}
                  >
                    {processing ? 'Processing...' : `Pay $${finalPrice.toLocaleString()} ${annual ? 'Annually' : 'Monthly'}`}
                  </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
