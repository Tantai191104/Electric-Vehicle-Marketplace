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

// Admin: Get subscription revenue
export async function getSubscriptionRevenue(req, res) {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;
    
    // Build date filter
    const matchQuery = {
      type: 'purchase',
      status: 'completed',
      reference: { $regex: /^subscription:/ }, // Only subscription purchases
    };

    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : now;
    
    // Normalize dates to start/end of day
    const startOfDay = new Date(start);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);
    
    matchQuery.createdAt = { $gte: startOfDay, $lte: endOfDay };

    // Get total revenue
    const totalStats = await WalletTransaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalPurchases: { $sum: 1 },
          avgPurchaseValue: { $avg: '$amount' },
        },
      },
    ]);

    const totals = totalStats[0] || {
      totalRevenue: 0,
      totalPurchases: 0,
      avgPurchaseValue: 0,
    };

    // Group by time period
    let timeGrouping = {};
    if (groupBy === 'month') {
      timeGrouping = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      };
    } else if (groupBy === 'day') {
      timeGrouping = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
      };
    } else if (groupBy === 'year') {
      timeGrouping = {
        year: { $year: '$createdAt' },
      };
    }

    const revenueByTime = await WalletTransaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: timeGrouping,
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Group by subscription plan
    const revenueByPlan = await WalletTransaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$metadata.subscriptionPlanId',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
          planName: { $first: '$description' }, // Extract plan name from description
        },
      },
      {
        $lookup: {
          from: 'subscriptionplans',
          localField: '_id',
          foreignField: '_id',
          as: 'plan',
        },
      },
      {
        $unwind: {
          path: '$plan',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          planId: '$_id',
          planName: { $ifNull: ['$plan.name', '$planName'] },
          planKey: '$plan.key',
          revenue: 1,
          count: 1,
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Format monthly data
    const formattedTimeData = revenueByTime.map((item) => {
      const id = item._id;
      if (groupBy === 'month') {
        return {
          period: `${id.month}/${id.year}`,
          label: `Tháng ${id.month}/${id.year}`,
          revenue: item.revenue,
          count: item.count,
        };
      } else if (groupBy === 'day') {
        return {
          period: `${id.day}/${id.month}/${id.year}`,
          label: `${id.day}/${id.month}/${id.year}`,
          revenue: item.revenue,
          count: item.count,
        };
      } else {
        return {
          period: `${id.year}`,
          label: `Năm ${id.year}`,
          revenue: item.revenue,
          count: item.count,
        };
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: totals.totalRevenue || 0,
          totalPurchases: totals.totalPurchases || 0,
          avgPurchaseValue: Math.round(totals.avgPurchaseValue || 0),
          period: {
            startDate: startOfDay,
            endDate: endOfDay,
          },
        },
        byTime: formattedTimeData,
        byPlan: revenueByPlan,
      },
    });
  } catch (error) {
    console.error('getSubscriptionRevenue error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}


