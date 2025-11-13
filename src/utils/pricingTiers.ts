export type PricingTier = 'free' | 'startup' | 'business' | 'enterprise';

export interface TierLimits {
  maxFilesPerMonth: number;
  maxRowsPerFile: number;
  features: string[];
}

export const PRICING_TIERS: Record<PricingTier, TierLimits> = {
  free: {
    maxFilesPerMonth: 1,
    maxRowsPerFile: 100,
    features: ['Basic insights only', 'Email support'],
  },
  startup: {
    maxFilesPerMonth: 5,
    maxRowsPerFile: 500,
    features: ['Full AI insights & reports', 'Sales forecasting', 'Priority support'],
  },
  business: {
    maxFilesPerMonth: 15,
    maxRowsPerFile: 1000,
    features: ['Advanced insights & modeling', 'Team dashboards & sharing', 'Dedicated account manager'],
  },
  enterprise: {
    maxFilesPerMonth: Infinity,
    maxRowsPerFile: Infinity,
    features: ['Unlimited DB linking (SQL, NoSQL)', 'All features included', '24/7 Premium Support'],
  },
};

export const getTierLimits = (tier: PricingTier): TierLimits => {
  return PRICING_TIERS[tier] || PRICING_TIERS.free;
};

export const canUploadFile = (tier: PricingTier, filesUploadedThisMonth: number): boolean => {
  const limits = getTierLimits(tier);
  return filesUploadedThisMonth < limits.maxFilesPerMonth;
};

export const canProcessRows = (tier: PricingTier, rowCount: number): boolean => {
  const limits = getTierLimits(tier);
  return rowCount <= limits.maxRowsPerFile;
};

