import { STATUS_CODE } from "../constants/httpStatus.js";
import Product from "../models/Product.js";

// Middleware kiểm tra user không được mua sản phẩm của chính mình
export const preventSelfPurchase = async (req, res, next) => {
  try {
    const user = req.user;
    const productId = req.body.product_id;

    if (!productId) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        message: "Product ID is required",
        errorCode: "PRODUCT_ID_REQUIRED"
      });
    }

    // Tìm sản phẩm
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        message: "Product not found",
        errorCode: "PRODUCT_NOT_FOUND"
      });
    }

    // Kiểm tra user có phải chủ sở hữu sản phẩm không
    if (product.sellerId && product.sellerId.toString() === user.userId) {
      return res.status(STATUS_CODE.FORBIDDEN).json({
        message: "Bạn không thể mua sản phẩm của chính mình",
        errorCode: "CANNOT_PURCHASE_OWN_PRODUCT"
      });
    }

    // Kiểm tra sản phẩm đã được bán chưa
    if (product.status === "sold") {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        message: "Sản phẩm này đã được bán",
        errorCode: "PRODUCT_ALREADY_SOLD"
      });
    }

    // Kiểm tra sản phẩm có đang active không
    if (product.status === "inactive") {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        message: "Sản phẩm này đã bị vô hiệu hóa",
        errorCode: "PRODUCT_INACTIVE"
      });
    }

    // Kiểm tra sản phẩm đã được duyệt chưa
    if (product.status === "pending") {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        message: "Sản phẩm này đang chờ xét duyệt",
        errorCode: "PRODUCT_PENDING_APPROVAL"
      });
    }

    // Kiểm tra sản phẩm bị từ chối
    if (product.status === "rejected") {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        message: "Sản phẩm này đã bị từ chối",
        errorCode: "PRODUCT_REJECTED"
      });
    }

    // Lưu thông tin sản phẩm vào request để sử dụng ở controller
    req.product = product;
    next();
  } catch (error) {
    return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi kiểm tra quyền sở hữu sản phẩm",
      errorCode: "OWNERSHIP_CHECK_ERROR"
    });
  }
};

// Middleware kiểm tra user chỉ có thể thao tác sản phẩm của chính mình (cho update/delete)
export const requireOwnership = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!id) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        message: "Product ID is required",
        errorCode: "PRODUCT_ID_REQUIRED"
      });
    }

    // Tìm sản phẩm
    const product = await Product.findById(id);
    if (!product) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        message: "Product not found",
        errorCode: "PRODUCT_NOT_FOUND"
      });
    }

    // Admin có thể thao tác bất kỳ sản phẩm nào
    if (user.role === "admin") {
      req.product = product;
      return next();
    }

    // User chỉ có thể thao tác sản phẩm của chính mình
    if (product.sellerId && product.sellerId.toString() !== user.userId) {
      return res.status(STATUS_CODE.FORBIDDEN).json({
        message: "Bạn chỉ có thể thao tác sản phẩm của chính mình",
        errorCode: "NOT_PRODUCT_OWNER"
      });
    }

    req.product = product;
    next();
  } catch (error) {
    return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi kiểm tra quyền sở hữu sản phẩm",
      errorCode: "OWNERSHIP_CHECK_ERROR"
    });
  }
};
