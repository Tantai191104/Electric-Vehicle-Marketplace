import mongoose from 'mongoose';

const usageSchema = new mongoose.Schema(
  {
    listingsUsed: { type: Number, default: 0 },
    aiUsed: { type: Number, default: 0 },
    highlightsUsed: { type: Number, default: 0 },
    cycleStart: { type: Date, required: true },
    cycleEnd: { type: Date, required: true },
  },
  { _id: false }
);

const userSubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    planKey: { type: String, enum: ['free', 'trial', 'pro'], required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    startedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    autoRenew: { type: Boolean, default: false },
    usage: usageSchema,
    lastListingAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('UserSubscription', userSubscriptionSchema);


