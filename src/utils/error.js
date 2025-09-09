import { STATUS_CODE, ERROR_CODE_ENUM } from "../constants/httpStatus.js";

export class ApiError extends Error {
  constructor(message = "Error", statusCode = STATUS_CODE.INTERNAL_SERVER_ERROR, errorCode = ERROR_CODE_ENUM.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

export function formatZodError(res, zodError) {
  const issues = Array.isArray(zodError?.issues)
    ? zodError.issues.map((i) => ({
        path: Array.isArray(i.path) ? i.path.join(".") : "",
        message: i.message,
        code: i.code,
      }))
    : [];

  return res.status(STATUS_CODE.BAD_REQUEST).json({
    message: "Validation failed",
    errorCode: ERROR_CODE_ENUM.VALIDATION_ERROR,
    issues,
  });
}

export class HttpException extends ApiError {
  constructor(message = "Http Exception Error", statusCode, errorCode) {
    super(message, statusCode, errorCode);
  }
}

export class InternalServerException extends ApiError {
  constructor(message = "Internal Server Error", errorCode) {
    super(
      message,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      errorCode || ERROR_CODE_ENUM.INTERNAL_SERVER_ERROR
    );
  }
}

export class NotFoundException extends ApiError {
  constructor(message = "Resource not found", errorCode) {
    super(
      message,
      STATUS_CODE.NOT_FOUND,
      errorCode || ERROR_CODE_ENUM.RESOURCE_NOT_FOUND
    );
  }
}

export class BadRequestException extends ApiError {
  constructor(message = "Bad Request", errorCode) {
    super(
      message,
      STATUS_CODE.BAD_REQUEST,
      errorCode || ERROR_CODE_ENUM.VALIDATION_ERROR
    );
  }
}

export class UnauthorizedException extends ApiError {
  constructor(message = "Unauthorized Access", errorCode) {
    super(
      message,
      STATUS_CODE.UNAUTHORIZED,
      errorCode || ERROR_CODE_ENUM.ACCESS_UNAUTHORIZED
    );
  }
}

export class ForbiddenException extends ApiError {
  constructor(message = "Access Forbidden", errorCode) {
    super(
      message,
      STATUS_CODE.FORBIDDEN,
      errorCode || ERROR_CODE_ENUM.ACCESS_FORBIDDEN
    );
  }
}

export class ConflictException extends ApiError {
  constructor(message = "Resource already exists", errorCode) {
    super(
      message,
      STATUS_CODE.CONFLICT,
      errorCode || ERROR_CODE_ENUM.RESOURCE_CONFLICT
    );
  }
}
