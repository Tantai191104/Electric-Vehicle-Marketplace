import Product from "../models/Product.js";
import User from "../models/User.js";
import UserSubscription from "../models/UserSubscription.js";

// Helper function to create aggregation pipeline for subscription-based sorting
export function createSubscriptionSortPipeline(baseQuery, skip = 0, limit = 10) {
  return [
    { $match: baseQuery },
    {
      $lookup: {
        from: "usersubscriptions",
        localField: "seller",
        foreignField: "userId",
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
        as: "seller"
      }
    },
    {
      $addFields: {
        seller: { $arrayElemAt: ["$seller", 0] }
      }
    },
    {
      $project: {
        sellerSubscription: 0,
        sellerPlanKey: 0,
        planPriority: 0
      }
    },
    {
      $sort: {
        planPriority: 1, // Lower number = higher priority (pro=1, trial=2, free=3)
        createdAt: -1   // Within same plan, newest first
      }
    },
    { $skip: skip },
    { $limit: limit }
  ];
}

// Helper function to format product with seller address
function formatProductWithAddress(product) {
  const productObj = product.toObject();
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
    
    // Use aggregation pipeline for consistent sorting with other product listings
    const pipeline = createSubscriptionSortPipeline({ seller: userId }, skip, limit);
    const [products, total] = await Promise.all([
      Product.aggregate(pipeline),
      Product.countDocuments({ seller: userId })
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
