import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      enum: ['free', 'trial', 'pro'],
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    priceVnd: { type: Number, default: 0 },
    billingCycle: { type: String, enum: ['monthly'], default: 'monthly' },
    isActive: { type: Boolean, default: true },

    quotas: {
      maxListingsPerCycle: { type: Number, required: true },
      aiUsagePerCycle: { type: Number, default: 0 },
      maxHighlightsPerCycle: { type: Number, default: 0 },
      highlightHoursPerListing: { type: Number, default: 0 },
      cooldownDaysBetweenListings: { type: Number, default: 0 },
    },

    features: {
      aiAssist: { type: Boolean, default: false },
      priorityBoost: { type: Boolean, default: false },
      manualReviewBypass: { type: Boolean, default: false },
      supportLevel: { type: String, enum: ['none', 'standard', 'priority'], default: 'none' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('SubscriptionPlan', subscriptionPlanSchema);


