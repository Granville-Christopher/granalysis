import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../components/home/theme";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, FileText, Mail, Database, Users } from "lucide-react";

const PrivacyPage: React.FC = () => {
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
            <div className={`p-3 rounded-lg ${colors.isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <Shield className={`w-6 h-6 ${colors.isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold ${colors.text}`}>Privacy Policy</h1>
              <p className={`text-sm mt-1 ${colors.textSecondary}`}>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className={`space-y-8 ${colors.text}`}>
            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <div className="flex items-start gap-3 mb-3">
                <Database className={`w-5 h-5 mt-1 flex-shrink-0`} style={{ color: colors.accent }} />
                <div>
                  <h2 className={`text-2xl font-semibold mb-3 ${colors.text}`}>1. Information We Collect</h2>
                  <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                    We collect information you provide directly to us and information collected automatically when you use our Service:
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>Account Information</h3>
                      <ul className={`list-disc ml-6 space-y-1 ${colors.textSecondary}`}>
                        <li>Name, email address, and company name</li>
                        <li>Billing address and payment information (processed securely through third-party providers)</li>
                        <li>Account preferences and settings</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>Data Files</h3>
                      <ul className={`list-disc ml-6 space-y-1 ${colors.textSecondary}`}>
                        <li>Files you upload for analysis (CSV, JSON, Excel, SQL, etc.)</li>
                        <li>Analysis results and generated insights</li>
                        <li>Custom configurations and saved preferences</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>Usage Data</h3>
                      <ul className={`list-disc ml-6 space-y-1 ${colors.textSecondary}`}>
                        <li>IP address, browser type, and device information</li>
                        <li>Pages visited, features used, and time spent on the Service</li>
                        <li>Error logs and performance metrics</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <div className="flex items-start gap-3 mb-3">
                <Eye className={`w-5 h-5 mt-1 flex-shrink-0`} style={{ color: colors.accent }} />
                <div>
                  <h2 className={`text-2xl font-semibold mb-3 ${colors.text}`}>2. How We Use Your Information</h2>
                  <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                    We use the information we collect to:
                  </p>
                  <ul className={`list-disc ml-6 space-y-2 ${colors.textSecondary}`}>
                    <li>Provide, maintain, and improve our services and user experience</li>
                    <li>Process transactions, send invoices, and manage subscriptions</li>
                    <li>Send technical notices, updates, security alerts, and support messages</li>
                    <li>Respond to your comments, questions, and support requests</li>
                    <li>Monitor and analyze usage patterns to improve service performance</li>
                    <li>Detect, prevent, and address technical issues and security threats</li>
                    <li>Comply with legal obligations and enforce our Terms of Service</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <div className="flex items-start gap-3 mb-3">
                <Lock className={`w-5 h-5 mt-1 flex-shrink-0`} style={{ color: colors.accent }} />
                <div>
                  <h2 className={`text-2xl font-semibold mb-3 ${colors.text}`}>3. Data Security</h2>
                  <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                    We implement industry-standard technical and organizational measures to protect your data:
                  </p>
                  <ul className={`list-disc ml-6 space-y-2 ${colors.textSecondary}`}>
                    <li><strong>Encryption:</strong> 256-bit AES encryption for data at rest, TLS 1.3 for data in transit</li>
                    <li><strong>Access Controls:</strong> Role-based access control, multi-factor authentication support</li>
                    <li><strong>Security Audits:</strong> Regular security assessments, penetration testing, and vulnerability scans</li>
                    <li><strong>Infrastructure:</strong> Secure cloud hosting with SOC 2 Type II compliance</li>
                    <li><strong>Monitoring:</strong> 24/7 security monitoring and incident response procedures</li>
                    <li><strong>Backup:</strong> Regular encrypted backups with disaster recovery procedures</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>4. Data Sharing and Disclosure</h2>
              <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                We do not sell your personal data. We may share your information only in the following circumstances:
              </p>
              <ul className={`list-disc ml-6 space-y-2 ${colors.textSecondary}`}>
                <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our Service (e.g., payment processors, cloud hosting)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice to users)</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>5. Your Rights (GDPR & CCPA)</h2>
              <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                Under GDPR (EU users) and CCPA (California users), you have the following rights:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${colors.text}`}>Access & Portability</h3>
                  <p className={`text-sm ${colors.textSecondary}`}>Request access to your personal data and receive it in a portable format</p>
                </div>
                <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${colors.text}`}>Rectification</h3>
                  <p className={`text-sm ${colors.textSecondary}`}>Correct inaccurate or incomplete personal information</p>
                </div>
                <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${colors.text}`}>Erasure</h3>
                  <p className={`text-sm ${colors.textSecondary}`}>Request deletion of your personal data ("right to be forgotten")</p>
                </div>
                <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${colors.text}`}>Objection</h3>
                  <p className={`text-sm ${colors.textSecondary}`}>Object to processing of your data for certain purposes</p>
                </div>
                <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${colors.text}`}>Restriction</h3>
                  <p className={`text-sm ${colors.textSecondary}`}>Request restriction of processing in certain circumstances</p>
                </div>
                <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${colors.text}`}>Withdraw Consent</h3>
                  <p className={`text-sm ${colors.textSecondary}`}>Withdraw consent at any time where processing is based on consent</p>
                </div>
              </div>
              <p className={`mt-4 text-sm ${colors.textSecondary}`}>
                To exercise these rights, contact us at <a href="mailto:privacy@granalysis.com" className="underline" style={{ color: colors.accent }}>privacy@granalysis.com</a>
              </p>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>6. Data Retention</h2>
              <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                We retain your data for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className={`list-disc ml-6 space-y-2 ${colors.textSecondary}`}>
                <li><strong>Active Accounts:</strong> Data is retained while your account is active</li>
                <li><strong>Deleted Accounts:</strong> Data is deleted within 30 days of account deletion, except where required by law</li>
                <li><strong>Backup Data:</strong> Encrypted backups may be retained for up to 90 days for disaster recovery</li>
                <li><strong>Legal Requirements:</strong> Some data may be retained longer if required by law or for legitimate business purposes</li>
              </ul>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>7. International Data Transfers</h2>
              <p className={`leading-relaxed ${colors.textSecondary}`}>
                Your data may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) for EU data transfers, to protect your data in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>8. Children's Privacy</h2>
              <p className={`leading-relaxed ${colors.textSecondary}`}>
                Our Service is not intended for children under 16 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>9. Changes to This Policy</h2>
              <p className={`leading-relaxed ${colors.textSecondary}`}>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <div className={`p-6 rounded-xl ${colors.isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex items-start gap-3">
                  <Mail className={`w-5 h-5 mt-0.5 flex-shrink-0`} style={{ color: colors.accent }} />
                  <div>
                    <h2 className={`text-2xl font-semibold mb-3 ${colors.text}`}>10. Contact Us</h2>
                    <p className={`leading-relaxed mb-3 ${colors.textSecondary}`}>
                      If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
                    </p>
                    <div className="space-y-2">
                      <p className={`font-medium ${colors.text}`} style={{ color: colors.accent }}>
                        Email: <a href="mailto:privacy@granalysis.com" className="underline">privacy@granalysis.com</a>
                      </p>
                      <p className={`font-medium ${colors.text}`} style={{ color: colors.accent }}>
                        Data Protection Officer: <a href="mailto:dpo@granalysis.com" className="underline">dpo@granalysis.com</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className={`mt-8 pt-6 border-t flex flex-wrap gap-4 text-sm ${colors.textSecondary}`} style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <Link to="/terms" className="hover:underline" style={{ color: colors.accent }}>Terms of Service</Link>
            <span>•</span>
            <Link to="/cookies" className="hover:underline" style={{ color: colors.accent }}>Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;

