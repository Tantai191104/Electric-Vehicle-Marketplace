import {
  getUserProfileService,
  updateUserProfileService,
  updateUserPreferencesService,
  getWalletBalanceService,
  getWalletTransactionsService,
  addToWishlistService,
  removeFromWishlistService,
  getUserWishlistService,
  getUserOrdersService,
  getOrderDetailsService,
  updateOrderStatusService
} from "../services/profileService.js";
import {
  updateProfileValidation,
  updatePreferencesValidation,
  addToWishlistValidation,
  updateOrderStatusValidation,
  uploadAvatarValidation,
  getWalletTransactionsValidation,
  getWishlistValidation,
  getOrdersValidation
} from "../validations/profile.validation.js";

export async function getUserProfile(req, res) {
  try {
    const userId = req.user.sub;
    const profile = await getUserProfileService(userId);
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateUserProfile(req, res) {
  try {
    const result = updateProfileValidation.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: result.error.errors[0]?.message || "Validation error"
      });
    }
    
    const userId = req.user.sub;
    const profileData = result.data;
    
    delete profileData.wallet;
    delete profileData.stats;
    delete profileData.role;
    delete profileData.isActive;
    
    const updatedProfile = await updateUserProfileService(userId, profileData);
    res.json(updatedProfile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateUserPreferences(req, res) {
  try {
    const result = updatePreferencesValidation.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.errors[0]?.message || "Validation error" });
    }
    
    const userId = req.user.sub;
    const preferences = result.data;
    
    const updatedUser = await updateUserPreferencesService(userId, preferences);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getWalletBalance(req, res) {
  try {
    const userId = req.user.sub;
    const wallet = await getWalletBalanceService(userId);
    res.json(wallet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getWalletTransactions(req, res) {
  try {
    const walletResult = getWalletTransactionsValidation.safeParse(req.query);
    if (!walletResult.success) {
      return res.status(400).json({ error: walletResult.error.errors[0]?.message || "Validation error" });
    }
    
    const userId = req.user.sub;
    const { page = 1, limit = 20 } = walletResult.data;
    
    const result = await getWalletTransactionsService(userId, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function addToWishlist(req, res) {
  try {
    const wishlistResult = addToWishlistValidation.safeParse(req.body);
    if (!wishlistResult.success) {
      return res.status(400).json({ error: wishlistResult.error.errors[0]?.message || "Validation error" });
    }
    
    const userId = req.user.sub;
    const { productId, notes } = wishlistResult.data;
    
    const wishlistItem = await addToWishlistService(userId, productId, notes);
    res.status(201).json(wishlistItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function removeFromWishlist(req, res) {
  try {
    const userId = req.user.sub;
    const { productId } = req.params;
    
    const result = await removeFromWishlistService(userId, productId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getUserWishlist(req, res) {
  try {
    const wishlistQueryResult = getWishlistValidation.safeParse(req.query);
    if (!wishlistQueryResult.success) {
      return res.status(400).json({ error: wishlistQueryResult.error.errors[0]?.message || "Validation error" });
    }
    
    const userId = req.user.sub;
    const { page = 1, limit = 20 } = wishlistQueryResult.data;
    
    const result = await getUserWishlistService(userId, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getUserOrders(req, res) {
  try {
    const ordersResult = getOrdersValidation.safeParse(req.query);
    if (!ordersResult.success) {
      return res.status(400).json({ error: ordersResult.error.errors[0]?.message || "Validation error" });
    }
    
    const userId = req.user.sub;
    const { type = 'all', page = 1, limit = 20 } = ordersResult.data;
    
    const result = await getUserOrdersService(userId, type, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getOrderDetails(req, res) {
  try {
    const userId = req.user.sub;
    const { orderId } = req.params;
    
    const order = await getOrderDetailsService(orderId, userId);
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const orderStatusResult = updateOrderStatusValidation.safeParse(req.body);
    if (!orderStatusResult.success) {
      return res.status(400).json({ error: orderStatusResult.error.errors[0]?.message || "Validation error" });
    }
    
    const userId = req.user.sub;
    const { orderId } = req.params;
    const { status, notes } = orderStatusResult.data;
    
    const order = await updateOrderStatusService(orderId, userId, status, notes);
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}




export async function uploadAvatar(req, res) {
  try {
    const userId = req.user.sub;
    const defaultAvatar = "https://via.placeholder.com/150x150/007bff/ffffff?text=Avatar";
    
    const updatedUser = await updateUserProfileService(userId, { avatar: defaultAvatar });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
