import Product from "../models/Product.js";
import User from "../models/User.js";

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

    if (filters.category) query.category = filters.category;
    if (filters.brand) query.brand = filters.brand;
    if (filters.model) query.model = filters.model;
    if (filters.seller) query.seller = filters.seller;
    if (filters.status) query.status = filters.status;
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

    const products = await Product.find(query)
      .populate("seller", "name email phone avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return {
      products,
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

export async function getProductByIdService(productId) {
  try {
    const product = await Product.findById(productId).populate("seller", "name email phone avatar");
    if (!product) {
      throw new Error("Product not found");
    }
    
    product.views += 1;
    await product.save();
    
    return product;
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
    ).populate("seller", "name email phone avatar");
    
    return updatedProduct;
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
    
    const products = await Product.find({ seller: userId })
      .populate("seller", "name email phone avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ seller: userId });

    return {
      products,
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
