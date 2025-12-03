import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { THEME_CONFIG, ThemeConfig } from "../components/home/theme";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Book, MessageCircle, Mail, ChevronDown, ChevronUp } from "lucide-react";

const HelpPage: React.FC = () => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const faqCategories = [
    {
      title: "Getting Started",
      items: [
        {
          q: "How do I upload my first file?",
          a: "Click the 'Upload File' button in the dashboard sidebar. Supported formats include CSV and Excel files. Once uploaded, your file will be automatically analyzed.",
        },
        {
          q: "What file formats are supported?",
          a: "We support CSV (.csv) and Excel (.xlsx, .xls) files. Files should contain structured data with headers in the first row.",
        },
        {
          q: "How long does analysis take?",
          a: "Analysis typically completes within seconds for files under 1000 rows. Larger files may take a few minutes. You'll see a progress indicator during processing.",
        },
      ],
    },
    {
      title: "Features & Usage",
      items: [
        {
          q: "What insights can I get from my data?",
          a: "You'll receive sales trends, profit analysis, product performance, customer insights, forecasts, AI recommendations, opportunities, risks, and anomalies.",
        },
        {
          q: "How does the AI Chat Assistant work?",
          a: "Available for Business and Enterprise tiers, the AI assistant can answer questions about your data, generate charts, perform calculations, and provide business advice. Simply click the chat icon in the bottom right.",
        },
        {
          q: "Can I export my data?",
          a: "Yes! You can export your data in CSV, Excel, or JSON formats from the file management section. This feature is available based on your subscription tier.",
        },
      ],
    },
    {
      title: "Account & Billing",
      items: [
        {
          q: "How do I upgrade my plan?",
          a: "Go to the Pricing page from the dashboard or sidebar. Select your desired plan and complete the payment. Your account will be upgraded immediately.",
        },
        {
          q: "Can I cancel my subscription?",
          a: "Yes, you can cancel your subscription at any time from your Account Settings. You'll continue to have access until the end of your billing period.",
        },
        {
          q: "What happens to my data if I downgrade?",
          a: "Your data remains accessible. However, you may need to delete files that exceed your new tier's limits. We'll notify you if any files need attention.",
        },
      ],
    },
    {
      title: "Security & Privacy",
      items: [
        {
          q: "How is my data secured?",
          a: "All data is encrypted with 256-bit AES encryption at rest and TLS in transit. We follow SOC 2 Type II and GDPR compliance standards.",
        },
        {
          q: "Can I delete my account?",
          a: "Yes, you can delete your account and all associated data from your Account Settings. This action is irreversible and complies with GDPR 'right to be forgotten' requirements.",
        },
        {
          q: "Who can see my data?",
          a: "Only you can access your data. Our team cannot view your files or insights. All data is encrypted and stored securely.",
        },
      ],
    },
    {
      title: "Troubleshooting",
      items: [
        {
          q: "My file upload failed. What should I do?",
          a: "Check that your file is under 10MB, has valid headers, and is in CSV or Excel format. Ensure you haven't exceeded your tier's file limit.",
        },
        {
          q: "I'm not receiving emails. What's wrong?",
          a: "Check your spam folder. Ensure your email address is verified in Account Settings. You can resend verification emails if needed.",
        },
        {
          q: "The dashboard is slow or not loading.",
          a: "Try refreshing the page. Clear your browser cache. If issues persist, check your internet connection or contact support.",
        },
      ],
    },
  ];

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.items.length > 0);

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  return (
    <div className={`min-h-screen ${colors.isDark ? 'bg-[#0B1B3B]' : 'bg-[#F9FAFB]'}`} style={{ paddingTop: '80px' }}>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 mb-6 ${colors.textSecondary} hover:${colors.text} transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div
          className={`p-8 rounded-2xl shadow-xl mb-8`}
          style={{
            backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          }}
        >
          <h1 className={`text-4xl font-bold mb-4 ${colors.text}`}>Help Center</h1>
          <p className={`mb-6 ${colors.textSecondary}`}>
            Find answers to common questions and get support
          </p>

          {/* Search */}
          <div className="relative mb-8">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${colors.textSecondary}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className={`w-full pl-12 pr-4 py-3 rounded-lg border ${colors.isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'} ${colors.text}`}
            />
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <a
              href="#faq"
              className={`p-4 rounded-lg border flex items-center gap-3 ${colors.isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
            >
              <Book className="w-5 h-5" style={{ color: colors.accent }} />
              <span className={colors.text}>FAQ</span>
            </a>
            <a
              href="mailto:support@granalysis.com"
              className={`p-4 rounded-lg border flex items-center gap-3 ${colors.isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
            >
              <Mail className="w-5 h-5" style={{ color: colors.accent }} />
              <span className={colors.text}>Email Support</span>
            </a>
            <a
              href="#contact"
              className={`p-4 rounded-lg border flex items-center gap-3 ${colors.isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
            >
              <MessageCircle className="w-5 h-5" style={{ color: colors.accent }} />
              <span className={colors.text}>Contact Us</span>
            </a>
          </div>
        </div>

        {/* FAQ Sections */}
        <div id="faq" className="space-y-4">
          {filteredCategories.map((category) => (
            <div
              key={category.title}
              className={`p-6 rounded-2xl shadow-xl`}
              style={{
                backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              }}
            >
              <button
                onClick={() => toggleSection(category.title)}
                className={`w-full flex items-center justify-between mb-4 ${colors.text}`}
              >
                <h2 className="text-2xl font-semibold">{category.title}</h2>
                {expandedSection === category.title ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {expandedSection === category.title && (
                <div className="space-y-4">
                  {category.items.map((item, idx) => (
                    <div key={idx} className="border-t pt-4" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                      <h3 className={`font-semibold mb-2 ${colors.text}`}>{item.q}</h3>
                      <p className={colors.textSecondary}>{item.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div
          id="contact"
          className={`mt-8 p-8 rounded-2xl shadow-xl`}
          style={{
            backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          }}
        >
          <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>Still Need Help?</h2>
          <p className={`mb-6 ${colors.textSecondary}`}>
            Can't find what you're looking for? Contact our support team.
          </p>
          <div className="space-y-4">
            <a
              href="mailto:support@granalysis.com"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white`}
              style={{ backgroundColor: colors.accent }}
            >
              <Mail className="w-5 h-5" />
              support@granalysis.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

