import SubscriptionPlan from '../models/SubscriptionPlan.js';
import UserSubscription from '../models/UserSubscription.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';

// Admin: Create plan
export async function createPlan(req, res) {
  try {
    const data = req.body;
    const existed = await SubscriptionPlan.findOne({ key: data.key });
    if (existed) {
      return res.status(409).json({ success: false, error: 'Plan key already exists' });
    }
    const plan = await SubscriptionPlan.create(data);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Admin: Update plan
export async function updatePlan(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const plan = await SubscriptionPlan.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Admin: List plans
export async function listPlans(req, res) {
  try {
    const { includeInactive } = req.query;
    const query = includeInactive ? {} : { isActive: true };
    const plans = await SubscriptionPlan.find(query).sort({ priceVnd: 1 });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Admin: Delete/Deactivate plan
export async function deactivatePlan(req, res) {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Public: Get active plans (for FE)
export async function getActivePlans(req, res) {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ priceVnd: 1 });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// User: Get my subscription
export async function getMySubscription(req, res) {
  try {
    const sub = await UserSubscription.findOne({ userId: req.user.sub }).populate('planId');
    res.json({ success: true, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// User: Get usage summary for progress UI
export async function getMySubscriptionUsage(req, res) {
  try {
    const sub = await UserSubscription.findOne({ userId: req.user.sub }).populate('planId');
    if (!sub || !sub.planId) return res.json({ success: true, data: null });

    const plan = sub.planId;
    const now = new Date();
    const daysLeft = sub.usage?.cycleEnd ? Math.max(0, Math.ceil((sub.usage.cycleEnd.getTime() - now.getTime()) / (24*60*60*1000))) : 0;
    const expiresInDays = sub.expiresAt ? Math.max(0, Math.ceil((new Date(sub.expiresAt).getTime() - now.getTime()) / (24*60*60*1000))) : 0;

    const remainingListings = Math.max(0, (plan.quotas?.maxListingsPerCycle || 0) - (sub.usage?.listingsUsed || 0));
    const remainingHighlights = Math.max(0, (plan.quotas?.maxHighlightsPerCycle || 0) - (sub.usage?.highlightsUsed || 0));

    res.json({
      success: true,
      data: {
        planKey: sub.planKey,
        planName: plan.name,
        remainingListings,
        remainingHighlights,
        daysLeft,
        expiresInDays,
        priorityLevel: plan.features?.priorityBoost ? 'high' : 'low',
        highlightHoursPerListing: plan.quotas?.highlightHoursPerListing || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Admin: Get user's subscription by userId
export async function getUserSubscriptionById(req, res) {
  try {
    const { userId } = req.params;
    const sub = await UserSubscription.findOne({ userId }).populate('planId');
    res.json({ success: true, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// User: Purchase subscription (deduct from wallet)
export async function purchaseSubscription(req, res) {
  try {
    const userId = req.user.sub;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'Plan ID is required' });
    }

    // Find the plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, error: 'Plan not found or inactive' });
    }

    // Free plan doesn't require payment
    if (plan.key === 'free' || plan.priceVnd === 0) {
      // Assign free plan without payment
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const upserted = await UserSubscription.findOneAndUpdate(
        { userId },
        {
          userId,
          planId: plan._id,
          planKey: plan.key,
          status: 'active',
          startedAt: now,
          expiresAt,
          autoRenew: false,
          usage: {
            listingsUsed: 0,
            aiUsed: 0,
            cycleStart: now,
            cycleEnd: expiresAt,
          },
        },
        { new: true, upsert: true }
      );

      return res.json({ success: true, data: upserted, message: 'Free plan activated successfully' });
    }

    // Check user wallet balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const walletBalance = user.wallet?.balance || 0;
    const planPrice = plan.priceVnd || 0;

    if (walletBalance < planPrice) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient wallet balance',
        message: `Số dư ví không đủ. Cần: ${planPrice.toLocaleString('vi-VN')} VND, Hiện có: ${walletBalance.toLocaleString('vi-VN')} VND`,
        required: planPrice,
        available: walletBalance,
      });
    }

    // Deduct from wallet
    const balanceBefore = walletBalance;
    const balanceAfter = balanceBefore - planPrice;

    user.wallet = user.wallet || {};
    user.wallet.balance = balanceAfter;
    user.wallet.totalSpent = (user.wallet.totalSpent || 0) + planPrice;
    await user.save();

    // Create wallet transaction
    await WalletTransaction.create({
      userId,
      type: 'purchase',
      amount: planPrice,
      balanceBefore,
      balanceAfter,
      description: `Mua gói subscription: ${plan.name}`,
      status: 'completed',
      paymentMethod: 'internal',
      reference: `subscription:${plan._id}`,
      metadata: {
        subscriptionPlanId: String(plan._id),
      },
    });

    // Assign subscription plan
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const upserted = await UserSubscription.findOneAndUpdate(
      { userId },
      {
        userId,
        planId: plan._id,
        planKey: plan.key,
        status: 'active',
        startedAt: now,
        expiresAt,
        autoRenew: false,
        usage: {
          listingsUsed: 0,
          aiUsed: 0,
          cycleStart: now,
          cycleEnd: expiresAt,
        },
      },
      { new: true, upsert: true }
    ).populate('planId');

    res.json({
      success: true,
      data: upserted,
      message: 'Mua gói subscription thành công',
      walletBalance: balanceAfter,
    });
  } catch (error) {
    console.error('Purchase subscription error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Admin: Assign a plan to user (trial/pro or reset free)
export async function assignPlanToUser(req, res) {
  try {
    const { userId } = req.params;
    const { planId } = req.body; // autoRenew is enforced to false for ZaloPay QR flow
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, error: 'Plan not found or inactive' });
    }

    const now = new Date();
    // Monthly cycles only (approximate by adding 1 calendar month)
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const upserted = await UserSubscription.findOneAndUpdate(
      { userId },
      {
        userId,
        planId: plan._id,
        planKey: plan.key,
        status: 'active',
        startedAt: now,
        expiresAt,
        autoRenew: false,
        usage: {
          listingsUsed: 0,
          aiUsed: 0,
          cycleStart: now,
          cycleEnd: expiresAt,
        },
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: upserted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}


