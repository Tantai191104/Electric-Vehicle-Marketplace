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
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const provinces = JSON.parse(fs.readFileSync(path.join(__dirname, "../constants/location/provinces.json"), "utf8"));
const districts = JSON.parse(fs.readFileSync(path.join(__dirname, "../constants/location/districts.json"), "utf8"));
const wards = JSON.parse(fs.readFileSync(path.join(__dirname, "../constants/location/wards.json"), "utf8"));
import {
  updateProfileValidation,
  updatePreferencesValidation,
  addToWishlistValidation,
  updateOrderStatusValidation,
  uploadAvatarValidation,
  getWalletTransactionsValidation,
  getWishlistValidation,
  getOrdersValidation,
  updateAddressValidation
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

export async function getProvinces(req, res) {
  res.json(provinces);
}

export async function getDistricts(req, res) {
  const { provinceCode } = req.query;
  if (!provinceCode) return res.status(400).json({ error: "provinceCode is required" });
  const province = provinces.find((p) => String(p.Code) === String(provinceCode) || String(p.ProvinceID) === String(provinceCode));
  if (!province) return res.status(404).json({ error: "Province not found" });
  const list = districts.filter((d) => Number(d.ProvinceID) === Number(province.ProvinceID));
  res.json(list);
}

export async function getWards(req, res) {
  const { districtId } = req.query;
  if (!districtId) return res.status(400).json({ error: "districtId is required" });
  const district = districts.find((d) => String(d.DistrictID) === String(districtId) || String(d.Code || '') === String(districtId));
  if (!district) return res.status(404).json({ error: "District not found" });
  const list = wards.filter((w) => Number(w.DistrictID) === Number(district.DistrictID));
  res.json(list);
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
    
    // Map location codes to names if provided
    const addr = profileData?.profile?.address;
    if (addr && addr.provinceCode && addr.districtCode && addr.wardCode) {
      const province = provinces.find(
        (p) => String(p.Code) === String(addr.provinceCode) || String(p.ProvinceID) === String(addr.provinceCode)
      );
      const provinceId = province ? province.ProvinceID : null;

      const district = districts.find(
        (d) => (
          String(d.DistrictID) === String(addr.districtCode) || String(d.Code || '') === String(addr.districtCode)
        ) && (provinceId == null || Number(d.ProvinceID) === Number(provinceId))
      );

      const ward = wards.find(
        (w) => String(w.WardCode) === String(addr.wardCode) && (
          !district || Number(w.DistrictID) === Number(district.DistrictID)
        )
      );

      profileData.profile = profileData.profile || {};
      profileData.profile.address = profileData.profile.address || {};
      profileData.profile.address.province = province ? province.ProvinceName : null;
      profileData.profile.address.district = district ? district.DistrictName : null;
      profileData.profile.address.ward = ward ? ward.WardName : null;
    }

    const updatedProfile = await updateUserProfileService(userId, profileData);
    res.json(updatedProfile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateUserAddress(req, res) {
  try {
    const body = updateAddressValidation.parse(req.body);
    const userId = req.user.sub;

    const province = provinces.find((p) => String(p.Code) === String(body.provinceCode) || String(p.ProvinceID) === String(body.provinceCode));
    if (!province) return res.status(400).json({ error: "Invalid provinceCode" });
    const district = districts.find((d) => (String(d.DistrictID) === String(body.districtCode) || String(d.Code || '') === String(body.districtCode)) && Number(d.ProvinceID) === Number(province.ProvinceID));
    if (!district) return res.status(400).json({ error: "Invalid districtCode for province" });
    const ward = wards.find((w) => String(w.WardCode) === String(body.wardCode) && Number(w.DistrictID) === Number(district.DistrictID));
    if (!ward) return res.status(400).json({ error: "Invalid wardCode for district" });

    const update = {
      profile: {
        address: {
          houseNumber: body.houseNumber || null,
          provinceCode: String(body.provinceCode),
          districtCode: String(body.districtCode),
          wardCode: String(body.wardCode),
          province: province.ProvinceName,
          district: district.DistrictName,
          ward: ward.WardName
        }
      }
    };

    const updated = await updateUserProfileService(userId, update);
    res.json(updated);
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
