import Product from "../models/Product.js";
import User from "../models/User.js";
import UserSubscription from "../models/UserSubscription.js";
import mongoose from "mongoose";

// Helper function to create aggregation pipeline for subscription-based sorting
export function createSubscriptionSortPipeline(baseQuery, skip = 0, limit = 10) {
  return [
    { $match: baseQuery },
    // Join only ACTIVE user subscription for the seller
    {
      $lookup: {
        from: "usersubscriptions",
        let: { sellerId: "$seller" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$userId", "$$sellerId"] },
                  { $eq: ["$status", "active"] }
                ]
              }
            }
          },
          { $project: { planKey: 1 } }
        ],
        as: "sellerSubscription"
      }
    },
    {
      $addFields: {
        sellerPlanKey: {
          $ifNull: [
            { $arrayElemAt: ["$sellerSubscription.planKey", 0] },
            "free" // Default to free if no subscription found
          ]
        },
        // Compute subscription-derived priority level
        subscriptionPriorityLevel: {
          $switch: {
            branches: [
              { case: { $eq: ["$sellerPlanKey", "pro"] }, then: "high" },
              { case: { $eq: ["$sellerPlanKey", "trial"] }, then: "medium" }
            ],
            default: "low"
          }
        },
        // Normalize to a numeric weight for sorting (lower is higher priority)
        priorityWeight: {
          $switch: {
            branches: [
              { case: { $eq: [ { $ifNull: ["$priorityLevel", null] }, "high" ] }, then: 1 },
              { case: { $eq: [ { $ifNull: ["$priorityLevel", null] }, "medium" ] }, then: 2 },
              { case: { $eq: [ { $ifNull: ["$priorityLevel", null] }, "low" ] }, then: 3 }
            ],
            // If product.priorityLevel missing, fallback to subscriptionPriorityLevel
            default: {
              $switch: {
                branches: [
                  { case: { $eq: ["$subscriptionPriorityLevel", "high"] }, then: 1 },
                  { case: { $eq: ["$subscriptionPriorityLevel", "medium"] }, then: 2 }
                ],
                default: 3
              }
            }
          }
        },
        planPriority: {
          $switch: {
            branches: [
              { case: { $eq: ["$sellerPlanKey", "pro"] }, then: 1 },
              { case: { $eq: ["$sellerPlanKey", "trial"] }, then: 2 },
              { case: { $eq: ["$sellerPlanKey", "free"] }, then: 3 }
            ],
            default: 3
          }
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "seller",
        foreignField: "_id",
        as: "sellerData"
      }
    },
    {
      $addFields: {
        seller: { $arrayElemAt: ["$sellerData", 0] }
      }
    },
    {
      $sort: {
        planPriority: 1,          // Subscription: pro > trial > free
        priorityWeight: 1,        // Product priority: high > medium > low
        createdAt: -1             // Newest first
      }
    },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        sellerSubscription: 0,
        sellerPlanKey: 0,
        planPriority: 0,
        sellerData: 0,
        priorityWeight: 0,
        subscriptionPriorityLevel: 0
      }
    }
  ];
}

// Helper function to format product with seller address
function formatProductWithAddress(product) {
  // Handle both Mongoose documents and plain objects from aggregate
  const productObj = product.toObject ? product.toObject() : product;
  if (productObj.seller?.profile?.address) {
    productObj.seller.address = {
      houseNumber: productObj.seller.profile.address.houseNumber || null,
      provinceCode: productObj.seller.profile.address.provinceCode || null,
      districtCode: productObj.seller.profile.address.districtCode || null,
      wardCode: productObj.seller.profile.address.wardCode || null,
      province: productObj.seller.profile.address.province || null,
      district: productObj.seller.profile.address.district || null,
      ward: productObj.seller.profile.address.ward || null
    };
  }
  if (productObj.seller?.profile) {
    delete productObj.seller.profile;
  }
  return productObj;
}

export async function createProductService(productData) {
  try {
    // Ensure seller has address configured in account profile
    const seller = await User.findById(productData.seller).select("profile.address");
    const addr = seller?.profile?.address || {};
    const hasCodes = !!(addr.provinceCode && addr.districtCode && addr.wardCode);
    if (!hasCodes) {
      const err = new Error("Please set your address in profile before creating a product");
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.create(productData);
    return product;
  } catch (error) {
    throw error;
  }
}

export async function listProductsService(filters, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    let query = {};

    // Chỉ hiển thị sản phẩm đã được duyệt (active) hoặc đã bán (sold)
    query.status = { $in: ["active", "sold"] };

    if (filters.category) query.category = filters.category;
    if (filters.brand) query.brand = filters.brand;
    if (filters.model) query.model = filters.model;
    if (filters.seller) query.seller = filters.seller;
    // Chỉ cho phép filter công khai theo active hoặc sold
    if (filters.status && ["active", "sold"].includes(filters.status)) {
      query.status = filters.status;
    }
    if (filters.condition) query.condition = filters.condition;
    if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    if (filters.minYear || filters.maxYear) {
      query.year = {};
      if (filters.minYear) query.year.$gte = filters.minYear;
      if (filters.maxYear) query.year.$lte = filters.maxYear;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { brand: { $regex: filters.search, $options: "i" } },
        { model: { $regex: filters.search, $options: "i" } },
      ];
    }

    // Use aggregation pipeline to join with UserSubscription and sort by subscription plan
    const pipeline = createSubscriptionSortPipeline(query, skip, limit);
    const products = await Product.aggregate(pipeline);
    const total = await Product.countDocuments(query);

    // Format products to include seller address in a clean format
    const formattedProducts = products.map(formatProductWithAddress);

    return {
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    // Enhanced error handling for aggregation pipeline
    if (error.name === 'MongoServerError') {
      console.error('MongoDB aggregation error:', error.message);
      throw new Error('Database query failed. Please try again.');
    }
    throw error;
  }
}

export async function getProductByIdService(productId) {
  try {
    const updated = await Product.findByIdAndUpdate(
      productId,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("seller", "name email phone avatar profile.address");
    if (!updated) {
      throw new Error("Product not found");
    }
    return formatProductWithAddress(updated);
  } catch (error) {
    throw error;
  }
}

export async function updateProductService(productId, productData, userId) {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    
    if (product.seller.toString() !== userId) {
      throw new Error("You can only update your own products");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId, 
      productData, 
      { new: true, runValidators: true }
    ).populate("seller", "name email phone avatar profile.address");
    
    return formatProductWithAddress(updatedProduct);
  } catch (error) {
    throw error;
  }
}

export async function deleteProductService(productId, userId) {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    
    if (product.seller.toString() !== userId) {
      throw new Error("You can only delete your own products");
    }

    await Product.findByIdAndDelete(productId);
    return { message: "Product deleted successfully" };
  } catch (error) {
    throw error;
  }
}

export async function getUserProductsService(userId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    // Ensure we match ObjectId correctly when filtering by seller
    const sellerObjectId = new mongoose.Types.ObjectId(String(userId));
    
    // Use aggregation pipeline for consistent sorting with other product listings
    const pipeline = createSubscriptionSortPipeline({ seller: sellerObjectId }, skip, limit);
    const [products, total] = await Promise.all([
      Product.aggregate(pipeline),
      Product.countDocuments({ seller: sellerObjectId })
    ]);

    // Format products to include seller address in a clean format
    const formattedProducts = products.map(formatProductWithAddress);

    return {
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
}
