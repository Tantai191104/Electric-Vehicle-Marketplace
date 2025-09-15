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
  uploadAvatar,
  getProvinces,
  getDistricts,
  getWards,
  updateUserAddress
} from "../controllers/profileController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.use(authenticate);
/**
 * @swagger
 * /profile/locations/provinces:
 *   get:
 *     summary: List provinces
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provinces
 */
router.get("/locations/provinces", getProvinces);

/**
 * @swagger
 * /profile/locations/districts:
 *   get:
 *     summary: List districts by provinceCode (Code or ProvinceID)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: provinceCode
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Districts
 */
router.get("/locations/districts", getDistricts);

/**
 * @swagger
 * /profile/locations/wards:
 *   get:
 *     summary: List wards by districtId (DistrictID or Code)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: districtId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Wards
 */
router.get("/locations/wards", getWards);

/**
 * @swagger
 * /profile/locations:
 *   put:
 *     summary: Update user's address using codes
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/locations", updateUserAddress);

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile and account endpoints
 */

/**
 * @swagger
 * /profile/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile details
 */
router.get("/profile", getUserProfile);
/**
 * @swagger
 * /profile/profile:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               profile:
 *                 type: object
 *                 properties:
 *                   address:
 *                     $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/profile", updateUserProfile);
/**
 * @swagger
 * /profile/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/preferences", updateUserPreferences);
/**
 * @swagger
 * /profile/avatar:
 *   post:
 *     summary: Upload avatar
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Uploaded
 */
router.post("/avatar", uploadAvatar);

/**
 * @swagger
 * /profile/wallet:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance
 */
router.get("/wallet", getWalletBalance);
/**
 * @swagger
 * /profile/wallet/transactions:
 *   get:
 *     summary: Get wallet transactions
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions
 */
router.get("/wallet/transactions", getWalletTransactions);

/**
 * @swagger
 * /profile/wishlist:
 *   get:
 *     summary: Get wishlist
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist
 */
router.get("/wishlist", getUserWishlist);
/**
 * @swagger
 * /profile/wishlist:
 *   post:
 *     summary: Add item to wishlist
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Added
 */
router.post("/wishlist", addToWishlist);
/**
 * @swagger
 * /profile/wishlist/{productId}:
 *   delete:
 *     summary: Remove item from wishlist
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Removed
 */
router.delete("/wishlist/:productId", removeFromWishlist);

/**
 * @swagger
 * /profile/orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders
 */
router.get("/orders", getUserOrders);
/**
 * @swagger
 * /profile/orders/{orderId}:
 *   get:
 *     summary: Get order details
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Details
 */
router.get("/orders/:orderId", getOrderDetails);
/**
 * @swagger
 * /profile/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/orders/:orderId/status", updateOrderStatus);

export default router;
