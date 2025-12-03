import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../components/home/theme";
import { Link } from "react-router-dom";
import { ArrowLeft, Cookie, Settings, Shield, AlertTriangle, Info } from "lucide-react";

const CookiesPage: React.FC = () => {
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
            <div className={`p-3 rounded-lg ${colors.isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
              <Cookie className={`w-6 h-6 ${colors.isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold ${colors.text}`}>Cookie Policy</h1>
              <p className={`text-sm mt-1 ${colors.textSecondary}`}>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className={`space-y-8 ${colors.text}`}>
            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <div className="flex items-start gap-3 mb-3">
                <Info className={`w-5 h-5 mt-1 flex-shrink-0`} style={{ color: colors.accent }} />
                <div>
                  <h2 className={`text-2xl font-semibold mb-3 ${colors.text}`}>1. What Are Cookies</h2>
                  <p className={`leading-relaxed ${colors.textSecondary}`}>
                    Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners. Cookies allow a website to recognize your device and store some information about your preferences or past actions.
                  </p>
                </div>
              </div>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>2. Types of Cookies We Use</h2>
              <div className="space-y-6">
                <div className={`p-5 rounded-xl ${colors.isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Shield className={`w-5 h-5 mt-0.5 flex-shrink-0 text-green-500`} />
                    <div>
                      <h3 className={`text-xl font-semibold mb-2 ${colors.text}`}>Essential Cookies</h3>
                      <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                        These cookies are strictly necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
                      </p>
                      <ul className={`list-disc ml-6 space-y-1 text-sm ${colors.textSecondary}`}>
                        <li><strong>Session Cookies:</strong> Maintain your login session and authentication state</li>
                        <li><strong>Security Cookies:</strong> Protect against cross-site request forgery (CSRF) attacks</li>
                        <li><strong>Preference Cookies:</strong> Remember your theme preferences (dark/light mode)</li>
                      </ul>
                      <p className={`mt-3 text-sm italic ${colors.textSecondary}`}>
                        These cookies cannot be disabled as they are essential for the Service to function.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-5 rounded-xl ${colors.isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Settings className={`w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500`} />
                    <div>
                      <h3 className={`text-xl font-semibold mb-2 ${colors.text}`}>Analytics Cookies</h3>
                      <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                        These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                      </p>
                      <ul className={`list-disc ml-6 space-y-1 text-sm ${colors.textSecondary}`}>
                        <li>Track page views and user navigation patterns</li>
                        <li>Measure feature usage and performance</li>
                        <li>Identify technical issues and optimize user experience</li>
                        <li>All analytics data is anonymized and aggregated</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className={`p-5 rounded-xl ${colors.isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Cookie className={`w-5 h-5 mt-0.5 flex-shrink-0 text-purple-500`} />
                    <div>
                      <h3 className={`text-xl font-semibold mb-2 ${colors.text}`}>Functional Cookies</h3>
                      <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                        These cookies enable enhanced functionality and personalization, such as remembering your preferences.
                      </p>
                      <ul className={`list-disc ml-6 space-y-1 text-sm ${colors.textSecondary}`}>
                        <li>Remember your language preferences</li>
                        <li>Store your dashboard layout and customization settings</li>
                        <li>Maintain your chat history and conversation state</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>3. Cookie Duration</h2>
              <div className="space-y-3">
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>Session Cookies</h3>
                  <p className={`leading-relaxed ${colors.textSecondary}`}>
                    These cookies are temporary and are deleted when you close your browser. They are used to maintain your session while you navigate the website.
                  </p>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>Persistent Cookies</h3>
                  <p className={`leading-relaxed ${colors.textSecondary}`}>
                    These cookies remain on your device for a set period (typically 30-365 days) or until you delete them. They remember your preferences and settings for future visits.
                  </p>
                </div>
              </div>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>4. Managing Cookies</h2>
              <p className={`mb-4 leading-relaxed ${colors.textSecondary}`}>
                You have control over cookies. You can manage them through your browser settings:
              </p>
              <div className={`p-5 rounded-xl mb-4 ${colors.isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-500`} />
                  <div>
                    <h3 className={`font-semibold mb-2 ${colors.text}`}>Important Note</h3>
                    <p className={`text-sm leading-relaxed ${colors.textSecondary}`}>
                      Disabling essential cookies may affect website functionality. Some features may not work properly if you block certain cookies.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>Browser Settings</h3>
                  <p className={`mb-2 leading-relaxed ${colors.textSecondary}`}>
                    Most browsers allow you to:
                  </p>
                  <ul className={`list-disc ml-6 space-y-1 ${colors.textSecondary}`}>
                    <li>View and delete cookies</li>
                    <li>Block cookies from specific sites</li>
                    <li>Block all cookies</li>
                    <li>Block third-party cookies</li>
                    <li>Clear all cookies when you close your browser</li>
                  </ul>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>Opt-Out Tools</h3>
                  <p className={`leading-relaxed ${colors.textSecondary}`}>
                    You can also use browser extensions and privacy tools to manage cookies. However, please note that blocking cookies may impact your experience on our Service.
                  </p>
                </div>
              </div>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>5. Third-Party Cookies</h2>
              <p className={`mb-3 leading-relaxed ${colors.textSecondary}`}>
                We may use third-party services that set their own cookies. These services help us provide and improve our Service:
              </p>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${colors.text}`}>Analytics Services</h3>
                  <p className={`text-sm ${colors.textSecondary}`}>
                    We use analytics services to understand how users interact with our Service. These services may set cookies to track usage patterns.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${colors.text}`}>Payment Processors</h3>
                  <p className={`text-sm ${colors.textSecondary}`}>
                    When you make a payment, our payment processors may set cookies to process transactions securely.
                  </p>
                </div>
                <p className={`text-sm italic mt-4 ${colors.textSecondary}`}>
                  Third-party cookies are governed by their respective privacy policies. We encourage you to review these policies.
                </p>
              </div>
            </section>

            <section className="border-b pb-6" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>6. Updates to This Policy</h2>
              <p className={`leading-relaxed ${colors.textSecondary}`}>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Cookie Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <div className={`p-6 rounded-xl ${colors.isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                <h2 className={`text-2xl font-semibold mb-3 ${colors.text}`}>7. Contact Us</h2>
                <p className={`leading-relaxed ${colors.textSecondary}`}>
                  If you have any questions about our use of cookies, please contact us at:
                </p>
                <p className={`mt-2 font-medium ${colors.text}`} style={{ color: colors.accent }}>
                  Email: <a href="mailto:privacy@granalysis.com" className="underline">privacy@granalysis.com</a>
                </p>
              </div>
            </section>
          </div>

          <div className={`mt-8 pt-6 border-t flex flex-wrap gap-4 text-sm ${colors.textSecondary}`} style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <Link to="/terms" className="hover:underline" style={{ color: colors.accent }}>Terms of Service</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:underline" style={{ color: colors.accent }}>Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;

