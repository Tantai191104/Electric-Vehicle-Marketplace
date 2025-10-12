import User from "../models/User.js";
import { STATUS_CODE } from "../constants/httpStatus.js";

export const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.sub || req.user?.id;

      if (!userId) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({
          message: "Authentication required",
        });
      }

      const user = await User.findById(userId).select("role isActive");

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
        // Helpful debug info to diagnose wrong role/token
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn('[authorize] Forbidden:', {
            path: req.path,
            method: req.method,
            required: allowedRoles,
            actual: user.role,
            userId,
          });
        }
        return res.status(STATUS_CODE.FORBIDDEN).json({
          message: `Access denied. Required roles: ${allowedRoles.join(", ")}. Your role: ${user.role}`,
        });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Optional authentication - allows both guest and authenticated users
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken || req.cookies?.token || req.headers?.authorization || "";

    if (typeof token === "string" && token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    if (token) {
      try {
        const { verifyJwt } = await import("../utils/jwt.js");
        const decoded = verifyJwt(token);
        
        if (decoded) {
          const userId = decoded.userId || decoded.sub;
          const user = await User.findById(userId).select("role isActive");
          
          if (user && user.isActive) {
            req.user = { 
              sub: userId, 
              id: userId, 
              role: user.role, 
              email: decoded.email,
              isAuthenticated: true 
            };
          }
        }
      } catch (error) {
        // Token invalid, continue as guest
      }
    }

    // Set default guest role if not authenticated
    if (!req.user) {
      req.user = { role: "guest", isAuthenticated: false };
    }

    next();
  } catch (error) {
    // On error, continue as guest
    req.user = { role: "guest", isAuthenticated: false };
    next();
  }
};

// Specific role requirements
export const requireAdmin = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[requireAdmin] Checking admin access:', {
      path: req.path,
      method: req.method,
      userRole: req.user?.role || req.userRole,
      userId: req.user?.id || req.user?.sub,
    });
  }
  return authorize("admin")(req, res, next);
};

export const requireUser = authorize("user"); // Chỉ người dùng marketplace (bán/mua)
export const requireAuth = authorize("user", "admin"); // Cả user và admin
