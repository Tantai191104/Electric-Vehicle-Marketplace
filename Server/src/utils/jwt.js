import jwt from "jsonwebtoken";

const { JWT_SECRET = "dev-secret", JWT_EXPIRES_IN = "7d" } = process.env;

// Ensure JWT_SECRET is consistent
const JWT_SECRET_FINAL = JWT_SECRET || "dev-secret";

export function signJwt(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET_FINAL, { expiresIn: JWT_EXPIRES_IN, ...options });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET_FINAL);
  } catch (err) {
    return null;
  }
}
