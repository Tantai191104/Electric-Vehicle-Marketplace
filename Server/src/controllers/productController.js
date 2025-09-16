import {
  createProductService,
  listProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
  getUserProductsService,
} from "../services/productService.js";
import {
  createProductValidation,
  updateProductValidation,
  getProductsValidation,
} from "../validations/product.validation.js";
import cloudinary from "../config/cloudinary.js";

export async function createProduct(req, res) {
  try {
    const result = createProductValidation.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: result.error.errors[0]?.message || "Validation error", 
        details: result.error.errors 
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
    res.status(201).json(product);
  } catch (err) {
    const status = err.statusCode || 400;
    res.status(status).json({ error: err.message });
  }
}

export async function listProducts(req, res) {
  try {
    const result = getProductsValidation.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ 
        error: result.error.errors[0]?.message || "Validation error", 
        details: result.error.errors 
      });
    }

    const { page, limit, ...filters } = result.data;
    const products = await listProductsService(filters, page, limit);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProductById(req, res) {
  try {
    const product = await getProductByIdService(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const result = updateProductValidation.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: result.error.errors[0]?.message || "Validation error", 
        details: result.error.errors 
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
    const result = await deleteProductService(req.params.id, userId);
    res.json(result);
  } catch (err) {
    if (err.message === "You can only delete your own products") {
      return res.status(403).json({ error: err.message });
    }
    res.status(404).json({ error: err.message });
  }
}

export async function getUserProducts(req, res) {
  try {
    const result = getProductsValidation.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ 
        error: result.error.errors[0]?.message || "Validation error", 
        details: result.error.errors 
      });
    }

    const { page, limit } = result.data;
    const userId = req.user.sub || req.user.id;
    const products = await getUserProductsService(userId, page, limit);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
