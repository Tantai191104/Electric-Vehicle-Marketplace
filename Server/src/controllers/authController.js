import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { signJwt, verifyJwt } from "../utils/jwt.js";
import { BadRequestException, UnauthorizedException } from "../utils/error.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { STATUS_CODE } from "../constants/httpStatus.js";
import UserSubscription from "../models/UserSubscription.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";

const isProd = process.env.NODE_ENV === "production";
const REFRESH_PATH = `${process.env.BASE_PATH || "/api"}/auth/refresh-token`;

const setAuthCookies = (res, accessToken, refreshToken) => {
  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 15,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: REFRESH_PATH, // chỉ gửi cookie này khi gọi refresh
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = registerSchema.parse(req.body);

    const exists = await User.findOne({ email });
    if (exists) throw new BadRequestException("Email already in use");

    const hashed = await hashPassword(password);
    const user = await User.create({
      name, email, password: hashed, phone: phone || null, role: role || "user", isActive: true,
    });

    // Auto-assign free plan to new users
    try {
      console.log("Attempting to assign free plan to new user:", user._id);
      const freePlan = await SubscriptionPlan.findOne({ key: "free", isActive: true });
      console.log("Free plan found:", freePlan ? freePlan._id : "NOT FOUND");
      
      if (freePlan) {
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const subscription = await UserSubscription.create({
          userId: user._id,
          planId: freePlan._id,
          planKey: "free",
          status: "active",
          startedAt: now,
          expiresAt,
          autoRenew: false,
          usage: {
            listingsUsed: 0,
            aiUsed: 0,
            highlightsUsed: 0,
            cycleStart: now,
            cycleEnd: expiresAt,
          },
        });
        console.log("Free plan assigned successfully:", subscription._id);
      } else {
        console.warn("Free plan not found or inactive");
      }
    } catch (subscriptionError) {
      console.error("Failed to assign free plan to new user:", subscriptionError.message);
      console.error("Error details:", subscriptionError);
      // Don't fail registration if subscription assignment fails
    }

    const accessToken = signJwt({ userId: user._id, role: user.role }, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" });
    const refreshToken = signJwt({ userId: user._id, role: user.role }, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" });
    setAuthCookies(res, accessToken, refreshToken);

    res.status(STATUS_CODE.CREATED).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      accessToken, refreshToken,
    });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const ok = await comparePassword(password, user.password);
    if (!ok) throw new UnauthorizedException("Invalid credentials");
    if (user.isActive === false) throw new UnauthorizedException("Account disabled");

    const accessToken = signJwt({ userId: user._id, role: user.role }, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" });
    const refreshToken = signJwt({ userId: user._id, role: user.role }, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" });
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      accessToken, refreshToken,
    });
  } catch (err) { next(err); }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new UnauthorizedException("No refresh token");

    const decoded = verifyJwt(token);
    if (!decoded) throw new UnauthorizedException("Invalid refresh token");

    const accessToken = signJwt({ userId: decoded.userId, role: decoded.role }, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" });

    res.cookie("accessToken", accessToken, {
      httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 1000 * 60 * 15,
    });

    res.json({ accessToken });
  } catch (err) { next(new UnauthorizedException("Invalid refresh token")); }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: REFRESH_PATH });
    res.clearCookie("token", { path: "/" });
    res.json({ message: "Logged out" });
  } catch (err) { next(err); }
};
