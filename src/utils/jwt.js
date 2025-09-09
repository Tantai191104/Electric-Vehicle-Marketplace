import jwt from "jsonwebtoken";

const { JWT_SECRET = "dev-secret", JWT_EXPIRES_IN = "7d" } = process.env;

export function signJwt(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, ...options });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
