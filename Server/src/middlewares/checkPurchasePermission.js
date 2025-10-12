import { STATUS_CODE } from "../constants/httpStatus.js";

// Middleware to check if user can make purchases
export const requirePurchasePermission = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user || !user.isAuthenticated) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        message: "Đăng nhập để mua hàng trên marketplace",
        errorCode: "LOGIN_REQUIRED"
      });
    }

    if (user.role === "guest") {
      return res.status(STATUS_CODE.FORBIDDEN).json({
        message: "Khách không thể mua hàng. Vui lòng đăng nhập.",
        errorCode: "GUEST_CANNOT_PURCHASE"
      });
    }

    // Chỉ User (người dùng marketplace) mới có thể mua hàng
    // Admin không mua hàng, chỉ quản lý platform
    if (user.role === "user") {
      return next();
    }

    if (user.role === "admin") {
      return res.status(STATUS_CODE.FORBIDDEN).json({
        message: "Admin không thể mua hàng trên platform. Vai trò admin chỉ để quản lý.",
        errorCode: "ADMIN_CANNOT_PURCHASE"
      });
    }

    return res.status(STATUS_CODE.FORBIDDEN).json({
      message: "Không có quyền mua hàng",
      errorCode: "INSUFFICIENT_PERMISSIONS"
    });
  } catch (error) {
    return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi kiểm tra quyền mua hàng",
      errorCode: "PERMISSION_CHECK_ERROR"
    });
  }
};

// Middleware to check if user can create/manage products
export const requireProductManagement = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user || !user.isAuthenticated) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        message: "Đăng nhập để đăng bán sản phẩm trên marketplace",
        errorCode: "LOGIN_REQUIRED"
      });
    }

    if (user.role === "guest") {
      return res.status(STATUS_CODE.FORBIDDEN).json({
        message: "Khách không thể đăng bán sản phẩm. Vui lòng đăng nhập.",
        errorCode: "GUEST_CANNOT_MANAGE_PRODUCTS"
      });
    }

    // Chỉ User (người bán trên marketplace) mới có thể tạo/quản lý sản phẩm
    // Admin không đăng bán sản phẩm, chỉ quản lý platform
    if (user.role === "user") {
      return next();
    }

    if (user.role === "admin") {
      return res.status(STATUS_CODE.FORBIDDEN).json({
        message: "Admin không thể đăng bán sản phẩm. Vai trò admin chỉ để quản lý platform.",
        errorCode: "ADMIN_CANNOT_SELL_PRODUCTS"
      });
    }

    return res.status(STATUS_CODE.FORBIDDEN).json({
      message: "Không có quyền quản lý sản phẩm",
      errorCode: "INSUFFICIENT_PERMISSIONS"
    });
  } catch (error) {
    return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi kiểm tra quyền quản lý sản phẩm",
      errorCode: "PERMISSION_CHECK_ERROR"
    });
  }
};
