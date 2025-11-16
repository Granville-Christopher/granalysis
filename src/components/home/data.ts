import { BarChart3, CloudUpload, DollarSign, ShieldCheck, TrendingUp, Users, Zap } from 'lucide-react';
import { FaqItem, FeatureCard, IndustryDetail, PricingTier } from './theme';

export const pricingData: PricingTier[] = [
  { 
    title: 'Free Tier', 
    price: 0, 
    description: 'Perfect for testing the waters and small personal projects.', 
    features: [
      '1 file/month, 100 rows max',
      'Basic KPIs & 7-day sales trend',
      'Top 3 products, Top 1 customer',
      '1 AI insight summary'
    ], 
    isHighlighted: false 
  },
  { 
    title: 'Startup', 
    price: 24, 
    description: 'Accelerate your initial growth with essential analytics.', 
    features: [
      '5 files/month, 500 rows max',
      '30-day trends & 7-day forecast',
      'Top 5 products, Top 3 customers',
      '3 AI recommendations'
    ], 
    isHighlighted: true 
  },
  { 
    title: 'Business', 
    price: 69, 
    description: 'Professional analytics for data-driven decisions.', 
    features: [
      '15 files/month, 1,000 rows max',
      'Full forecasting & advanced insights',
      'RFM, CLV, Product Performance Matrix',
      'All AI recommendations & opportunities'
    ], 
    isHighlighted: false 
  },
  { 
    title: 'Enterprise', 
    price: 179, 
    description: 'Unlimited scale and premium features for large organizations.', 
    features: [
      'Unlimited files & rows',
      'Database linking & API access',
      'All advanced analytics & AI features',
      'Team collaboration & 24/7 support'
    ], 
    isHighlighted: false 
  },
];

export const featureCards: FeatureCard[] = [
  { title: 'Upload & Analyze', description: 'Securely connect data from CSV, JSON, or databases.', icon: CloudUpload },
  { title: 'AI Insights', description: 'Instant, deep-dive analysis powered by the proprietary AI model.', icon: Zap },
  { title: 'Forecasting & Recommendations', description: 'Predict future trends and get actionable, step-by-step advice.', icon: TrendingUp },
  { title: 'Interactive Dashboards', description: 'Visually explore your metrics with fully customizable, real-time charts.', icon: BarChart3 },
];

export const healthMetrics = [
  { label: 'API Latency', value: '35ms', color: 'text-green-500' },
  { label: 'Uptime', value: '99.98%', color: 'text-green-500' },
  { label: 'AI Response', value: '1.2s', color: 'text-yellow-500' },
];

export const testimonials = [
  { quote: "Granalysis transformed how we approach quarterly sales planning. The predictive insights are uncanny.", name: "Sarah J.", title: "Head of Marketing, Nexus Corp" },
  { quote: "The glassmorphic dashboard is not just beautiful, it's incredibly functional. A true leap forward in analytics tools.", name: "David M.", title: "VP of Sales, TechWave" },
  { quote: "Seamless data upload and immediate actionable recommendations. Our pipeline health has never been better.", name: "Emily K.", title: "Growth Strategist, E-Com Pro" },
];

export const faqData: FaqItem[] = [
  {
    question: 'How does Granalysis turn my raw data into intelligence?',
    answer: 'We securely ingest your data (CSV, SQL, NoSQL) and process it using our **proprietary, advanced AI model**. This system instantly performs deep correlation analysis, identifies anomalies, and structures the findings into natural language reports, moving beyond basic charting to true strategic insight.',
  },
  {
    question: 'What kind of actionable recommendations can I expect?',
    answer: 'You receive **prioritized, step-by-step recommendations** for immediate implementation. This includes predictive sales forecasts, optimal resource allocation suggestions, and specific steps to mitigate identified risks, all designed to increase pipeline velocity and close rates.',
  },
  {
    question: 'Is my sensitive sales data secure and compliant?',
    answer: 'Yes. We adhere strictly to **SOC 2 Type II** and **GDPR** compliance standards. All data is protected with 256-bit AES encryption both in transit and at rest, leveraging Google Cloud\'s highly secure infrastructure to ensure maximum privacy and integrity.',
  },
];

export const detailedUseCases: IndustryDetail[] = [
  {
    industry: 'E-commerce & Retail',
    icon: DollarSign,
    color: 'text-red-500',
    details: [
      { title: 'Inventory Optimization', description: 'AI predicts product demand fluctuations and recommends optimal restocking points to minimize capital lock-up and maximize availability. Includes SKU-level forecasting.', tags: ['Forecasting', 'Logistics', 'Inventory'] },
      { title: 'Customer Lifetime Value (CLV)', description: 'Segment customers based on predicted CLV to tailor marketing spend, improving ROI on retention campaigns and personalized offers.', tags: ['Marketing', 'CRM', 'Retention'] },
    ]
  },
  {
    industry: 'SaaS & Subscriptions',
    icon: Users,
    color: 'text-purple-500',
    details: [
      { title: 'Proactive Churn Modeling', description: 'Analyzes user behavior (login frequency, feature usage, support tickets) to assign a real-time risk score to every user, triggering intervention alerts before cancellation.', tags: ['Retention', 'Risk Scoring', 'Product'] },
      { title: 'Feature Usage Analysis', description: 'Correlates specific feature adoption rates with successful subscription renewals to prioritize product roadmap development and identify "sticky" features.', tags: ['Product Strategy', 'Adoption', 'Growth'] },
    ]
  },
  {
    industry: 'B2B & Enterprise',
    icon: BarChart3,
    color: 'text-yellow-500',
    details: [
      { title: 'Pipeline Health Diagnostic', description: 'Assesses the quality of deals in the pipeline, identifying bottlenecks in the sales cycle and flagging deals likely to stall or fail based on historical patterns.', tags: ['Sales Ops', 'Efficiency', 'Forecasting'] },
      { title: 'Pricing Sensitivity Modeling', description: 'Determines the optimal pricing tiers and discount levels for different customer segments to maximize profit per deal.', tags: ['Revenue Mgmt', 'Strategy', 'Pricing'] },
    ]
  },
  {
    industry: 'Financial Services',
    icon: ShieldCheck,
    color: 'text-green-500',
    details: [
      { title: 'Compliance Reporting Automation', description: 'Automates data lineage and audit-trail generation for regulatory needs (e.g., Basel, MiFID II), drastically cutting manual effort.', tags: ['Compliance', 'Audit', 'Regulation'] },
      { title: 'Fraud Pattern Detection', description: 'Uses machine learning to identify unusual transaction patterns in real-time that bypass traditional rule-based security systems.', tags: ['Security', 'Risk'] },
    ]
  },
];

export const monthlySalesData = [
  { month: 'Jan', 'Product A': 40, 'Product B': 30, 'Product C': 20 },
  { month: 'Feb', 'Product A': 55, 'Product B': 25, 'Product C': 25 },
  { month: 'Mar', 'Product A': 60, 'Product B': 35, 'Product C': 30 },
  { month: 'Apr', 'Product A': 75, 'Product B': 40, 'Product C': 35 },
  { month: 'May', 'Product A': 80, 'Product B': 30, 'Product C': 45 },
  { month: 'Jun', 'Product A': 95, 'Product B': 45, 'Product C': 50 },
];

export interface CaseStudy {
  id: string;
  company: string;
  industry: string;
  logo: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    value: string;
    improvement: string;
  }[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
  duration: string;
}

export const caseStudies: CaseStudy[] = [
  {
    id: '1',
    company: 'Zenith Capital',
    industry: 'Financial Services',
    logo: 'ZC',
    challenge: 'Manual compliance reporting was consuming 40+ hours weekly, with high error rates and regulatory risk. The team struggled to generate audit trails and data lineage documentation for Basel III and MiFID II requirements.',
    solution: 'Granalysis automated the entire compliance workflow, integrating with their existing SQL databases to generate real-time audit trails, data lineage maps, and regulatory reports. The AI model identifies anomalies and flags potential compliance issues before they escalate.',
    results: [
      { metric: 'Time Saved', value: '95%', improvement: 'From 40 hours to 2 hours per week' },
      { metric: 'Error Reduction', value: '98%', improvement: 'Automated validation eliminated manual mistakes' },
      { metric: 'Cost Savings', value: '$2.4M', improvement: 'Annual savings on compliance operations' }
    ],
    testimonial: {
      quote: 'Granalysis transformed our compliance operations. What used to take our team days now happens automatically, and we\'ve never been more confident in our regulatory reporting.',
      author: 'Michael Chen',
      role: 'Chief Compliance Officer'
    },
    duration: '6 months'
  },
  {
    id: '2',
    company: 'Aether Dynamics',
    industry: 'SaaS & Subscriptions',
    logo: 'AD',
    challenge: 'Customer churn was at 18% annually, with limited visibility into at-risk accounts. The sales team had no predictive indicators to intervene before cancellations occurred.',
    solution: 'Implemented Granalysis churn prediction model that analyzes user behavior patterns, feature adoption rates, and support ticket sentiment. The system generates real-time risk scores and automated alerts for accounts requiring intervention.',
    results: [
      { metric: 'Churn Reduction', value: '62%', improvement: 'From 18% to 6.8% annually' },
      { metric: 'Revenue Retention', value: '$4.2M', improvement: 'Additional ARR saved through proactive interventions' },
      { metric: 'Prediction Accuracy', value: '91%', improvement: 'Identifies at-risk customers 30+ days in advance' }
    ],
    testimonial: {
      quote: 'The churn prediction model is incredibly accurate. We now save accounts we would have lost, and our customer success team can focus on high-value interventions.',
      author: 'Sarah Martinez',
      role: 'VP of Customer Success'
    },
    duration: '4 months'
  },
  {
    id: '3',
    company: 'Global Tech Solutions',
    industry: 'B2B & Enterprise',
    logo: 'GTS',
    challenge: 'Sales pipeline forecasting was inaccurate, with only 65% forecast accuracy. The team couldn\'t identify which deals were likely to close, leading to poor resource allocation and missed targets.',
    solution: 'Deployed Granalysis pipeline health diagnostic that analyzes deal progression patterns, historical close rates, and engagement signals. The AI provides deal-level risk scores and recommends optimal next actions for each opportunity.',
    results: [
      { metric: 'Forecast Accuracy', value: '94%', improvement: 'From 65% to 94% accuracy' },
      { metric: 'Win Rate', value: '38%', improvement: 'Increased from 28% to 38%' },
      { metric: 'Sales Cycle', value: '-22%', improvement: 'Reduced average sales cycle by 3 weeks' }
    ],
    testimonial: {
      quote: 'Our sales forecasting is now spot-on. The pipeline insights help us focus on deals that will actually close, and we\'ve consistently hit our targets since implementation.',
      author: 'David Thompson',
      role: 'Chief Revenue Officer'
    },
    duration: '5 months'
  },
  {
    id: '4',
    company: 'Apex Logistics',
    industry: 'E-commerce & Retail',
    logo: 'AL',
    challenge: 'Inventory management was inefficient, with frequent stockouts and overstock situations. The company lacked demand forecasting capabilities, leading to $8M in lost sales and $3M in excess inventory costs annually.',
    solution: 'Granalysis AI demand forecasting model analyzes historical sales data, seasonal patterns, and external factors to predict SKU-level demand. The system recommends optimal reorder points and quantities, integrated with their ERP system.',
    results: [
      { metric: 'Stockout Reduction', value: '78%', improvement: 'From 12% to 2.6% stockout rate' },
      { metric: 'Inventory Costs', value: '-$2.1M', improvement: 'Reduced excess inventory by 35%' },
      { metric: 'Revenue Increase', value: '+$6.5M', improvement: 'Captured previously lost sales opportunities' }
    ],
    testimonial: {
      quote: 'The demand forecasting is incredibly precise. We\'ve eliminated stockouts on our top products while reducing inventory carrying costs significantly.',
      author: 'Jennifer Park',
      role: 'Supply Chain Director'
    },
    duration: '3 months'
  },
  {
    id: '5',
    company: 'Future Bank',
    industry: 'Financial Services',
    logo: 'FB',
    challenge: 'Fraud detection systems were missing sophisticated attacks, with false positives overwhelming the operations team. Traditional rule-based systems couldn\'t adapt to evolving fraud patterns.',
    solution: 'Implemented Granalysis ML-based fraud detection that analyzes transaction patterns, user behavior, and network relationships in real-time. The system learns from new fraud patterns and reduces false positives through advanced anomaly detection.',
    results: [
      { metric: 'Fraud Detection', value: '96%', improvement: 'Identifies fraud patterns missed by legacy systems' },
      { metric: 'False Positives', value: '-73%', improvement: 'Reduced from 15% to 4% of flagged transactions' },
      { metric: 'Cost Savings', value: '$1.8M', improvement: 'Prevented fraud losses and reduced operational overhead' }
    ],
    testimonial: {
      quote: 'The AI fraud detection system caught sophisticated attacks our old system missed. False positives dropped dramatically, allowing our team to focus on real threats.',
      author: 'Robert Kim',
      role: 'Head of Security Operations'
    },
    duration: '4 months'
  },
  {
    id: '6',
    company: 'Innovate Labs',
    industry: 'SaaS & Subscriptions',
    logo: 'IL',
    challenge: 'Product roadmap decisions were based on intuition rather than data. The team couldn\'t identify which features drove retention and which were underutilized, leading to wasted development resources.',
    solution: 'Granalysis feature usage analysis correlates feature adoption with subscription renewals and customer lifetime value. The AI identifies "sticky" features that drive retention and recommends product roadmap priorities based on data-driven insights.',
    results: [
      { metric: 'Retention Rate', value: '+24%', improvement: 'Increased from 76% to 94% annual retention' },
      { metric: 'Feature Adoption', value: '+45%', improvement: 'Improved adoption of key retention-driving features' },
      { metric: 'Development ROI', value: '340%', improvement: 'Better resource allocation based on data insights' }
    ],
    testimonial: {
      quote: 'Data-driven product decisions transformed our roadmap. We now build features that actually move the needle on retention, and our development resources are allocated much more effectively.',
      author: 'Amanda Foster',
      role: 'Chief Product Officer'
    },
    duration: '6 months'
  }
];

