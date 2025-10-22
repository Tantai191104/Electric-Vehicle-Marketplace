export type AdminSubscription = {
    _id?: string;
    id?: string;
    key?: string;
    name: string;
    description?: string;
    priceVnd?: number;
    price?: number;
    billingCycle?: string;
    duration?: string;
    isActive?: boolean;
    suitable?: string;
    quotas?: {
        maxHighlightsPerCycle?: number;
        maxListingsPerCycle?: number;
        aiUsagePerCycle?: number;
        highlightHoursPerListing?: number;
        cooldownDaysBetweenListings?: number;
    };
    features?: {
        aiAssist?: boolean;
        priorityBoost?: boolean;
        manualReviewBypass?: boolean;
        supportLevel?: string;
    };
    // audit fields from server
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
};

export type SubscriptionSavePayload = {
    name: string;
    description?: string;
    priceVnd?: number;
    billingCycle?: string;
    isActive?: boolean;
    quotas?: {
        maxHighlightsPerCycle?: number;
        maxListingsPerCycle?: number;
        aiUsagePerCycle?: number;
        highlightHoursPerListing?: number;
        cooldownDaysBetweenListings?: number;
    };
    features?: {
        aiAssist?: boolean;
        priorityBoost?: boolean;
        manualReviewBypass?: boolean;
        supportLevel?: string;
    };
    // server will add timestamps and version; not required when saving
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
};
