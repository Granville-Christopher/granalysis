import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../components/home/theme";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Shield, CreditCard, AlertCircle, Mail } from "lucide-react";

const TermsPage: React.FC = () => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);

  return (
    <div 
      className={`min-h-screen transition-colors duration-300`}
      style={{ 
        background: colors.isDark
          ? `linear-gradient(135deg, #0B1B3B 0%, #1A345B 50%, #0B1B3B 100%)`
          : `linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 50%, #F9FAFB 100%)`,
        paddingTop: '80px' 
      }}
    >
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Link
          to="/home"
          className={`inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-all duration-300 ${
            colors.isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
          } ${colors.textSecondary} hover:${colors.text}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div
          className={`${glassmorphismClass} p-8 md:p-12 rounded-2xl shadow-2xl`}
          style={{
            backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            boxShadow: colors.cardShadow,
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-lg ${colors.isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <FileText className={`w-6 h-6 ${colors.isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold ${colors.text}`}>Terms of Service</h1>
              <p className={`text-sm mt-1 ${colors.textSecondary}`}>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className={`space-y-8 ${colors.text}`}>
            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <div className="flex items-start gap-3 mb-3">
                <Shield className={`w-5 h-5 mt-1 flex-shrink-0 ${colors.accent}`} style={{ color: colors.accent }} />
                <div>
                  <h2 className={`text-2xl font-semibold mb-3 ${colors.text}`}>1. Acceptance of Terms</h2>
                  <p className={`leading-relaxed ${colors.textSecondary}`}>
                    By accessing and using Granalysis ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>
              </div>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>2. Use License</h2>
              <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                Permission is granted to temporarily use Granalysis for personal and commercial data analysis purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className={`list-disc ml-6 mt-2 space-y-2 ${colors.textSecondary}`}>
                <li>Modify or copy the materials or software</li>
                <li>Use the materials for any commercial purpose without explicit written permission</li>
                <li>Attempt to reverse engineer, decompile, or disassemble any software contained in Granalysis</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                <li>Use the Service in any way that violates applicable laws or regulations</li>
              </ul>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>3. User Accounts and Responsibilities</h2>
              <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                You are responsible for maintaining the confidentiality of your account credentials, including your password. You agree to:
              </p>
              <ul className={`list-disc ml-6 mt-2 space-y-2 ${colors.textSecondary}`}>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Ensure that all information provided during registration is accurate and current</li>
                <li>Maintain the security of your account credentials</li>
                <li>Not share your account with others or allow unauthorized access</li>
              </ul>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>4. Data Ownership and Privacy</h2>
              <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                Your data is encrypted and stored securely using industry-standard encryption (256-bit AES). We respect your data ownership rights:
              </p>
              <ul className={`list-disc ml-6 mt-2 space-y-2 ${colors.textSecondary}`}>
                <li>You retain all rights to your data and intellectual property</li>
                <li>We do not share your data with third parties except as described in our <Link to="/privacy" className="underline" style={{ color: colors.accent }}>Privacy Policy</Link></li>
                <li>You can export your data at any time in various formats (CSV, JSON, Excel)</li>
                <li>You can delete your account and all associated data at any time</li>
                <li>We use your data solely to provide and improve our services</li>
              </ul>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <div className="flex items-start gap-3 mb-3">
                <CreditCard className={`w-5 h-5 mt-1 flex-shrink-0`} style={{ color: colors.accent }} />
                <div>
                  <h2 className={`text-2xl font-semibold mb-3 ${colors.text}`}>5. Subscription and Billing</h2>
                  <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                    Subscriptions are billed in advance on a monthly or annual basis. Key billing terms:
                  </p>
                  <ul className={`list-disc ml-6 mt-2 space-y-2 ${colors.textSecondary}`}>
                    <li>You can cancel your subscription at any time from your account settings</li>
                    <li>You will continue to have access until the end of your current billing period</li>
                    <li>No refunds are provided for partial billing periods</li>
                    <li>Price changes will be communicated 30 days in advance</li>
                    <li>Annual subscriptions receive a 15% discount compared to monthly billing</li>
                    <li>All fees are exclusive of applicable taxes, which you are responsible for paying</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>6. Service Availability and Modifications</h2>
              <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                We strive to maintain high service availability but do not guarantee uninterrupted access. We reserve the right to:
              </p>
              <ul className={`list-disc ml-6 mt-2 space-y-2 ${colors.textSecondary}`}>
                <li>Modify or discontinue the Service at any time with reasonable notice</li>
                <li>Perform scheduled maintenance that may temporarily interrupt service</li>
                <li>Update features, functionality, or pricing as needed</li>
                <li>Suspend accounts that violate these Terms</li>
              </ul>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className={`w-5 h-5 mt-1 flex-shrink-0`} style={{ color: colors.accent }} />
                <div>
                  <h2 className={`text-2xl font-semibold mb-3 ${colors.text}`}>7. Limitation of Liability</h2>
                  <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                    To the maximum extent permitted by law:
                  </p>
                  <ul className={`list-disc ml-6 mt-2 space-y-2 ${colors.textSecondary}`}>
                    <li>Granalysis shall not be liable for any indirect, incidental, special, consequential, or punitive damages</li>
                    <li>Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim</li>
                    <li>We provide the Service "as is" without warranties of any kind, express or implied</li>
                    <li>We do not guarantee the accuracy, completeness, or usefulness of any insights or analysis</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>8. Intellectual Property</h2>
              <p className={`leading-relaxed ${colors.textSecondary}`}>
                The Service, including all software, designs, text, graphics, and other materials, is owned by Granalysis and protected by copyright, trademark, and other intellectual property laws. You may not use our trademarks, logos, or other proprietary information without our prior written consent.
              </p>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>9. Termination</h2>
              <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                We may terminate or suspend your account immediately, without prior notice, if you breach these Terms. Upon termination:
              </p>
              <ul className={`list-disc ml-6 mt-2 space-y-2 ${colors.textSecondary}`}>
                <li>Your right to use the Service will immediately cease</li>
                <li>You may request export of your data within 30 days of termination</li>
                <li>All provisions that by their nature should survive termination will remain in effect</li>
              </ul>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>10. Governing Law</h2>
              <p className={`leading-relaxed ${colors.textSecondary}`}>
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions. Any disputes arising from these Terms shall be resolved through binding arbitration.
              </p>
            </section>

            <section>
              <div className={`p-6 rounded-xl ${colors.isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex items-start gap-3">
                  <Mail className={`w-5 h-5 mt-0.5 flex-shrink-0`} style={{ color: colors.accent }} />
                  <div>
                    <h2 className={`text-2xl font-semibold mb-3 ${colors.text}`}>11. Contact Information</h2>
                    <p className={`leading-relaxed ${colors.textSecondary}`}>
                      If you have any questions about these Terms of Service, please contact us at:
                    </p>
                    <p className={`mt-2 font-medium ${colors.text}`} style={{ color: colors.accent }}>
                      Email: <a href="mailto:support@granalysis.com" className="underline">support@granalysis.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className={`mt-8 pt-6 border-t flex flex-wrap gap-4 text-sm ${colors.textSecondary}`} style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <Link to="/privacy" className="hover:underline" style={{ color: colors.accent }}>Privacy Policy</Link>
            <span>•</span>
            <Link to="/cookies" className="hover:underline" style={{ color: colors.accent }}>Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

