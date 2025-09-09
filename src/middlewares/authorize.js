import UserModel from "../models/userModel.js";
import { STATUS_CODE } from "../constants/httpStatus.js";

export const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({
          message: "Authentication required",
        });
      }

      const user = await UserModel.findById(userId).select("role isActive");

      if (!user) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({
          message: "User not found",
        });
      }

      if (!user.isActive) {
        return res.status(STATUS_CODE.FORBIDDEN).json({
          message: "Account is deactivated",
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(STATUS_CODE.FORBIDDEN).json({
          message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
        });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAdmin = authorize("admin");
export const requireAdminOrStaff = authorize("admin", "staff");
export const requireAuth = authorize("admin", "staff", "customer");
