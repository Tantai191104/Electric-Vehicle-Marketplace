import { ZodError } from "zod";
import { ApiError, formatZodError } from "../utils/error.js";
import { STATUS_CODE } from "../constants/httpStatus.js";

const REFRESH_PATH = `${process.env.BASE_PATH || "/api"}/auth/refresh-token`;

export const errorHandler = (error, req, res, next) => {
  console.error(`❌ Error on PATH: ${req.path}`, error);

  if (req.path === REFRESH_PATH) {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: REFRESH_PATH });
  }

  if (error instanceof SyntaxError) {
    return res.status(STATUS_CODE.BAD_REQUEST).json({
      message: "Invalid JSON format, please check your request body",
    });
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  if (error instanceof ZodError) {
    return formatZodError(res, error);
  }

  return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: error?.message || "Unknown error occurred",
  });
};
