import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  getWalletBalance,
  getWalletTransactions,
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
  uploadAvatar
} from "../controllers/profileController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.use(authenticate);


router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.put("/preferences", updateUserPreferences);
router.post("/avatar", uploadAvatar);

router.get("/wallet", getWalletBalance);
router.get("/wallet/transactions", getWalletTransactions);

router.get("/wishlist", getUserWishlist);
router.post("/wishlist", addToWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);

router.get("/orders", getUserOrders);
router.get("/orders/:orderId", getOrderDetails);
router.put("/orders/:orderId/status", updateOrderStatus);

export default router;
