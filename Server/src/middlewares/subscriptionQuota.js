import UserSubscription from '../models/UserSubscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';

// Ensure monthly cycle boundaries and reset usage if cycle passed
async function refreshCycleIfNeeded(userSub) {
  const now = new Date();
  if (!userSub.usage || !userSub.usage.cycleStart || !userSub.usage.cycleEnd) {
    const start = new Date(now);
    const end = new Date(now);
    end.setMonth(end.getMonth() + 1);
    userSub.usage = {
      listingsUsed: 0,
      aiUsed: 0,
      cycleStart: start,
      cycleEnd: end,
    };
    return userSub.save();
  }

  if (now > userSub.usage.cycleEnd) {
    const start = new Date(userSub.usage.cycleEnd);
    const end = new Date(userSub.usage.cycleEnd);
    end.setMonth(end.getMonth() + 1);
    userSub.usage.listingsUsed = 0;
    userSub.usage.aiUsed = 0;
    userSub.usage.cycleStart = start;
    userSub.usage.cycleEnd = end;
    return userSub.save();
  }
}

export async function enforceListingQuota(req, res, next) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const userSub = await UserSubscription.findOne({ userId }).populate('planId');
    if (!userSub || userSub.status !== 'active' || new Date(userSub.expiresAt) <= new Date()) {
      return res.status(403).json({ success: false, error: 'Gói của bạn đã hết hạn hoặc chưa được gán' });
    }

    await refreshCycleIfNeeded(userSub);

    const plan = userSub.planId || (await SubscriptionPlan.findById(userSub.planId));
    if (!plan) return res.status(400).json({ success: false, error: 'Subscription plan not found' });

    const maxListings = plan.quotas?.maxListingsPerCycle ?? 0;
    if (userSub.usage.listingsUsed >= maxListings) {
      return res.status(403).json({ success: false, error: 'Bạn đã hết lượt đăng trong chu kỳ này' });
    }

    // Cooldown for Free if configured
    const cooldownDays = plan.quotas?.cooldownDaysBetweenListings || 0;
    if (cooldownDays > 0 && userSub.lastListingAt) {
      const nextAllowed = new Date(userSub.lastListingAt);
      nextAllowed.setDate(nextAllowed.getDate() + cooldownDays);
      if (new Date() < nextAllowed) {
        const diffMs = nextAllowed.getTime() - Date.now();
        const remainingDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
        return res.status(403).json({ success: false, error: `Vui lòng chờ thêm ${remainingDays} ngày để đăng tiếp` });
      }
    }

    // Attach to request for controller to increment after creation
    req.subscriptionContext = { userSubId: userSub._id };
    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function incrementListingUsage(userSubId) {
  if (!userSubId) return;
  const sub = await UserSubscription.findById(userSubId);
  if (!sub) return;
  sub.usage.listingsUsed = (sub.usage.listingsUsed || 0) + 1;
  sub.lastListingAt = new Date();
  await sub.save();
}


