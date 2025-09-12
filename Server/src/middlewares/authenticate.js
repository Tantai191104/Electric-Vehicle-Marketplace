import { verifyJwt } from "../utils/jwt.js";
import { UnauthorizedException } from "../utils/error.js";
import { STATUS_CODE, ERROR_CODE_ENUM } from "../constants/httpStatus.js";

export const authenticate = (req, res, next) => {
  try {
    let token = req.cookies?.accessToken || req.cookies?.token || req.headers?.authorization || "";

    if (typeof token === "string" && token.startsWith("Bearer ")) token = token.slice(7);
    if (!token) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        message: "No token provided",
        errorCode: ERROR_CODE_ENUM.ACCESS_UNAUTHORIZED,
      });
    }

    const decoded = verifyJwt(token);
    if (!decoded) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        message: "Invalid or expired token",
        errorCode: ERROR_CODE_ENUM.AUTH_INVALID_TOKEN,
      });
    }

    req.user = { sub: decoded.userId || decoded.sub, id: decoded.userId || decoded.sub, role: decoded.role, email: decoded.email };
    next();
  } catch (e) {
    return res.status(STATUS_CODE.UNAUTHORIZED).json({
      message: "Unauthorized",
      errorCode: ERROR_CODE_ENUM.ACCESS_UNAUTHORIZED,
    });
  }
};
