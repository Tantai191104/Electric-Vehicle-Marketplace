import User from "../models/User.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Wishlist from "../models/Wishlist.js";
import Order from "../models/Order.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const provinces = JSON.parse(fs.readFileSync(path.join(__dirname, "../constants/location/provinces.json"), "utf8"));
const districts = JSON.parse(fs.readFileSync(path.join(__dirname, "../constants/location/districts.json"), "utf8"));
const wards = JSON.parse(fs.readFileSync(path.join(__dirname, "../constants/location/wards.json"), "utf8"));

export async function getUserProfileService(userId) {
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
}

export async function updateUserProfileService(userId, profileData) {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: profileData
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
}

export async function updateUserPreferencesService(userId, preferences) {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { preferences }
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
}

export async function updateUserAddressService(userId, addressData) {
  try {
    // Validate location codes first
    const province = provinces.find((p) => 
      String(p.Code) === String(addressData.provinceCode) || 
      String(p.ProvinceID) === String(addressData.provinceCode)
    );
    if (!province) {
      throw new Error(`Invalid provinceCode: ${addressData.provinceCode}`);
    }

    const district = districts.find((d) => 
      (String(d.DistrictID) === String(addressData.districtCode) || 
       String(d.Code || '') === String(addressData.districtCode)) && 
      Number(d.ProvinceID) === Number(province.ProvinceID)
    );
    if (!district) {
      throw new Error(`Invalid districtCode: ${addressData.districtCode} for province: ${province.ProvinceName}`);
    }

    const ward = wards.find((w) => 
      String(w.WardCode) === String(addressData.wardCode) && 
      Number(w.DistrictID) === Number(district.DistrictID)
    );
    if (!ward) {
      throw new Error(`Invalid wardCode: ${addressData.wardCode} for district: ${district.DistrictName}`);
    }

    // Prepare address data with both codes and names
    const fullAddressData = {
      houseNumber: addressData.houseNumber || null,
      provinceCode: String(province.Code || province.ProvinceID),
      districtCode: String(district.DistrictID),
      wardCode: String(ward.WardCode),
      province: province.ProvinceName,
      district: district.DistrictName,
      ward: ward.WardName
    };

    // Use findById and save to trigger pre-save hooks
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update the address
    user.profile = user.profile || {};
    user.profile.address = fullAddressData;
    
    // Save to trigger pre-save hooks
    await user.save();
    
    // Return user without password
    const updatedUser = await User.findById(userId).select('-password');
    return updatedUser;
  } catch (error) {
    throw error;
  }
}

export async function getWalletBalanceService(userId) {
  try {
    const user = await User.findById(userId).select('wallet');
    if (!user) {
      throw new Error("User not found");
    }
    return user.wallet;
  } catch (error) {
    throw error;
  }
}

export async function getWalletTransactionsService(userId, page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;
    
    const transactions = await WalletTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await WalletTransaction.countDocuments({ userId });
    
    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
}


export async function addToWishlistService(userId, productId, notes = null) {
  try {
    const existingItem = await Wishlist.findOne({ userId, productId });
    if (existingItem) {
      throw new Error("Product already in wishlist");
    }
    
    const wishlistItem = await Wishlist.create({
      userId,
      productId,
      notes,
      addedAt: new Date()
    });
    
    return wishlistItem;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Product already in wishlist");
    }
    throw error;
  }
}


export async function removeFromWishlistService(userId, productId) {
  try {
    const result = await Wishlist.findOneAndDelete({ userId, productId });
    if (!result) {
      throw new Error("Item not found in wishlist");
    }
    return { message: "Item removed from wishlist" };
  } catch (error) {
    throw error;
  }
}

export async function getUserWishlistService(userId, page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;
    
    const wishlistItems = await Wishlist.find({ userId })
      .sort({ addedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Wishlist.countDocuments({ userId });
    
    return {
      items: wishlistItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
}

export async function getUserOrdersService(userId, type = 'all', page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;
    let query = {};
    
    if (type === 'buyer') {
      query.buyerId = userId;
    } else if (type === 'seller') {
      query.sellerId = userId;
    } else {
      query.$or = [{ buyerId: userId }, { sellerId: userId }];
    }
    
    const orders = await Order.find(query)
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email')
      .populate('productId', 'title images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments(query);
    
    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
}


export async function getOrderDetailsService(orderId, userId) {
  try {
    const order = await Order.findOne({
      _id: orderId,
      $or: [{ buyerId: userId }, { sellerId: userId }]
    })
    .populate('buyerId', 'name email phone')
    .populate('sellerId', 'name email phone')
    .populate('productId', 'title images description');
    
    if (!order) {
      throw new Error("Order not found or access denied");
    }
    
    return order;
  } catch (error) {
    throw error;
  }
}

export async function updateOrderStatusService(orderId, userId, status, notes = null) {
  try {
    const order = await Order.findOne({
      _id: orderId,
      $or: [{ buyerId: userId }, { sellerId: userId }]
    });
    
    if (!order) {
      throw new Error("Order not found or access denied");
    }
    
    order.timeline.push({
      status,
      description: notes || `Status changed to ${status}`,
      updatedBy: userId
    });
    
    order.status = status;
    if (notes) {
      order.notes = notes;
    }
    
    await order.save();
    
    return order;
  } catch (error) {
    throw error;
  }
}


