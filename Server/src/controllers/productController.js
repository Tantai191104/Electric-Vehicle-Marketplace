import {
  createProductService,
  listProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
  getUserProductsService,
  createSubscriptionSortPipeline,
} from "../services/productService.js";
import Product from "../models/Product.js";
import UserSubscription from "../models/UserSubscription.js";
import {
  createProductValidation,
  updateProductValidation,
  getProductsValidation,
} from "../validations/product.validation.js";
import cloudinary from "../config/cloudinary.js";
import { incrementListingUsage } from "../middlewares/subscriptionQuota.js";

// Helper function to get products sorted by subscription plan
async function getProductsSortedByPlan(query, page = 1, limit = 10) {
  const skip = (Number(page) - 1) * Number(limit);
  
  const pipeline = createSubscriptionSortPipeline(query, skip, Number(limit));
  const [products, total] = await Promise.all([
    Product.aggregate(pipeline),
    Product.countDocuments(query)
  ]);

  return {
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  };
}

export async function createProduct(req, res) {
  try {
    const result = createProductValidation.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: result.error.issues?.[0]?.message || "Validation error", 
        details: result.error.issues 
      });
    }

    const productData = {
      ...result.data,
      seller: req.user.sub || req.user.id
    };

    // Upload files if provided
    const files = req.files || [];
    if (files.length > 0) {
      const uploadPromises = files.map((file) => new Promise((resolve) => {
        const resource_type = file.mimetype.startsWith('video') ? 'video' : 'image';
        cloudinary.uploader.upload_stream({ resource_type }, (err, uploaded) => {
          if (err) return resolve({ success: false, error: err.message });
          resolve({ success: true, url: uploaded.secure_url, resource_type });
        }).end(file.buffer);
      }));

      const results = await Promise.all(uploadPromises);
      const successes = results.filter(r => r.success);
      // Order: videos first, then images
      const ordered = [
        ...successes.filter(r => r.resource_type === 'video').map(r => r.url),
        ...successes.filter(r => r.resource_type === 'image').map(r => r.url)
      ];
      productData.images = ordered;
    }

    const product = await createProductService(productData);
    // Increment quota usage if present
    if (req.subscriptionContext?.userSubId) {
      await incrementListingUsage(req.subscriptionContext.userSubId);
    }
    res.status(201).json(product);
  } catch (err) {
    const status = err.statusCode || 400;
    res.status(status).json({ error: err.message });
  }
}

export async function getProducts(req, res) {
  try {
    const result = getProductsValidation.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ 
        error: result.error.issues?.[0]?.message || "Validation error", 
        details: result.error.issues 
      });
    }

    const products = await listProductsService(result.data);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProductById(req, res) {
  try {
    const product = await getProductByIdService(req.params.id);
    res.json({ product });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const result = updateProductValidation.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: result.error.issues?.[0]?.message || "Validation error", 
        details: result.error.issues 
      });
    }

    const userId = req.user.sub || req.user.id;
    const product = await updateProductService(req.params.id, result.data, userId);
    res.json(product);
  } catch (err) {
    if (err.message === "You can only update your own products") {
      return res.status(403).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const userId = req.user.sub || req.user.id;
    await deleteProductService(req.params.id, userId);
    res.json({ success: true });
  } catch (err) {
    if (err.message === "You can only delete your own products") {
      return res.status(403).json({ error: err.message });
    }
    res.status(404).json({ error: err.message });
  }
}

export async function getUserProducts(req, res) {
  try {
    const userId = req.user.sub || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const products = await getUserProductsService(userId, page, limit);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getVehicles(req, res) {
  try {
    const { page = 1, limit = 10, status = "active" } = req.query;
    const query = { 
      category: "vehicle",
      ...(status && { status })
    };
    
    const result = await getProductsSortedByPlan(query, page, limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getBatteries(req, res) {
  try {
    const { page = 1, limit = 10, status = "active" } = req.query;
    const query = { 
      category: "battery",
      ...(status && { status })
    };
    
    const result = await getProductsSortedByPlan(query, page, limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getMotorcycles(req, res) {
  try {
    const { page = 1, limit = 10, status = "active" } = req.query;
    const query = { 
      category: "motorcycle",
      ...(status && { status })
    };
    
    const result = await getProductsSortedByPlan(query, page, limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function markProductAsSold(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.sub || req.user.id;

    // Tìm sản phẩm
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        error: "Sản phẩm không tồn tại" 
      });
    }

    // Kiểm tra user có phải chủ sở hữu sản phẩm không
    if (product.seller.toString() !== userId) {
      return res.status(403).json({ 
        error: "Bạn chỉ có thể cập nhật sản phẩm của chính mình" 
      });
    }

    // Kiểm tra sản phẩm đã được duyệt chưa
    if (product.status === "pending") {
      return res.status(400).json({ 
        error: "Sản phẩm đang chờ xét duyệt, chưa thể cập nhật đã bán" 
      });
    }

    // Kiểm tra sản phẩm chưa được đánh dấu sold
    if (product.status === "sold") {
      return res.status(400).json({ 
        error: "Đã được cập nhật trước đó" 
      });
    }

    // Cập nhật status thành sold
    await Product.findByIdAndUpdate(id, { status: "sold" });

    res.json({
      success: true,
      message: "Thành công",
      data: {
        productId: id,
        status: "sold"
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Người bán có thể đánh dấu sản phẩm chưa bán (nếu muốn bán lại)
export async function markProductAsAvailable(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.sub || req.user.id;

    // Tìm sản phẩm
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        error: "Sản phẩm không tồn tại" 
      });
    }

    // Kiểm tra user có phải chủ sở hữu sản phẩm không
    if (product.seller.toString() !== userId) {
      return res.status(403).json({ 
        error: "Bạn chỉ có thể đánh dấu sản phẩm của chính mình" 
      });
    }

    // Cập nhật status thành active
    await Product.findByIdAndUpdate(id, { status: "active" });

    res.json({
      success: true,
      message: "Đã cập nhật sản phẩm là có thể bán",
      data: {
        productId: id,
        status: "active"
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update contract template for product (seller only)
export async function updateProductContractTemplate(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.sub || req.user.id;
    const { htmlContent, sellerSignature, pdfUrl } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Sản phẩm không tồn tại" });
    }

    if (product.seller.toString() !== userId) {
      return res.status(403).json({ error: "Chỉ người bán mới có thể chỉnh sửa hợp đồng" });
    }

    product.contractTemplate = {
      htmlContent: htmlContent || null,
      sellerSignature: sellerSignature || null,
      pdfUrl: pdfUrl || null,
      createdAt: new Date()
    };

    await product.save();

    res.json({
      success: true,
      message: "Cập nhật hợp đồng thành công",
      data: {
        productId: id,
        contractTemplate: product.contractTemplate
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get contract template for product (anyone can view)
export async function getProductContractTemplate(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).select('contractTemplate title seller');
    
    if (!product) {
      return res.status(404).json({ error: "Sản phẩm không tồn tại" });
    }

    res.json({
      success: true,
      data: {
        productId: id,
        productTitle: product.title,
        contractTemplate: product.contractTemplate || null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
