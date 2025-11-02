export type SubscriptionPlan = {
  id: string;
  name: string;
  icon: React.ReactNode;
  price: number;
  duration: string;
  color: string;
  badge?: string;
  features: string[];
  bonuses?: string[];
  suitable: string;
  popular?: boolean;
  recommended?: boolean;
  // Optional fields mapped from server
  quotas?: {
    maxHighlightsPerCycle?: number;
    maxListingsPerCycle?: number;
    aiUsagePerCycle?: number;
    highlightHoursPerListing?: number;
    cooldownDaysBetweenListings?: number;
  };
  featuresObj?: {
    aiAssist?: boolean;
    priorityBoost?: boolean;
    manualReviewBypass?: boolean;
    supportLevel?: string;
  };
};

export type TempUpgrade = {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
};

export type AdditionalService = {
  id: string;
  name: string;
  price: number;
  description: string;
};
