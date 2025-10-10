import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  getWalletBalance,
  getWalletTransactions,
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

// User và Admin đều có thể quản lý profile riêng của mình
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
router.get("/profile/locations/provinces", getProvinces);

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
router.get("/profile/locations/districts", getDistricts);

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
router.get("/profile/locations/wards", getWards);

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
router.put("/profile/locations", updateUserAddress);

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
router.get("/profile/profile", getUserProfile);
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
router.put("/profile/profile", updateUserProfile);
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
router.put("/profile/preferences", updateUserPreferences);
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
router.post("/profile/avatar", uploadAvatar);

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
router.get("/profile/wallet", getWalletBalance);
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
router.get("/profile/wallet/transactions", getWalletTransactions);


/**
 * @swagger
 * /profile/orders:
 *   get:
 *     summary: Get user's orders with full product details
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, buyer, seller]
 *           default: all
 *         description: Filter orders by type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Orders with full product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       orderNumber:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, confirmed, shipped, delivered, cancelled, refunded]
 *                       totalAmount:
 *                         type: number
 *                       shippingFee:
 *                         type: number
 *                       finalAmount:
 *                         type: number
 *                       productId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                           description:
 *                             type: string
 *                           price:
 *                             type: number
 *                           brand:
 *                             type: string
 *                           model:
 *                             type: string
 *                           year:
 *                             type: number
 *                           condition:
 *                             type: string
 *                           category:
 *                             type: string
 *                           specifications:
 *                             type: object
 *                       buyerId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                       sellerId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       400:
 *         description: Validation error
 */
router.get("/profile/orders", getUserOrders);
/**
 * @swagger
 * /profile/orders/{orderId}:
 *   get:
 *     summary: Get detailed order information with full product details
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Detailed order information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 orderNumber:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [pending, confirmed, shipped, delivered, cancelled, refunded]
 *                 quantity:
 *                   type: number
 *                 unitPrice:
 *                   type: number
 *                 totalAmount:
 *                   type: number
 *                 shippingFee:
 *                   type: number
 *                 commission:
 *                   type: number
 *                 finalAmount:
 *                   type: number
 *                 productId:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                     price:
 *                       type: number
 *                     brand:
 *                       type: string
 *                     model:
 *                       type: string
 *                     year:
 *                       type: number
 *                     condition:
 *                       type: string
 *                     category:
 *                       type: string
 *                     specifications:
 *                       type: object
 *                       properties:
 *                         batteryCapacity:
 *                           type: string
 *                         range:
 *                           type: string
 *                         chargingTime:
 *                           type: string
 *                         power:
 *                           type: string
 *                         maxSpeed:
 *                           type: string
 *                         batteryType:
 *                           type: string
 *                         voltage:
 *                           type: string
 *                         capacity:
 *                           type: string
 *                         cycleLife:
 *                           type: string
 *                         warranty:
 *                           type: string
 *                         compatibility:
 *                           type: string
 *                     length:
 *                       type: number
 *                       description: Package length in cm
 *                     width:
 *                       type: number
 *                       description: Package width in cm
 *                     height:
 *                       type: number
 *                       description: Package height in cm
 *                     weight:
 *                       type: number
 *                       description: Package weight in grams
 *                 buyerId:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                 sellerId:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                 shipping:
 *                   type: object
 *                   properties:
 *                     method:
 *                       type: string
 *                     trackingNumber:
 *                       type: string
 *                     carrier:
 *                       type: string
 *                     estimatedDelivery:
 *                       type: string
 *                       format: date-time
 *                     actualDelivery:
 *                       type: string
 *                       format: date-time
 *                 shippingAddress:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     address:
 *                       type: string
 *                     city:
 *                       type: string
 *                     province:
 *                       type: string
 *                     zipCode:
 *                       type: string
 *                 payment:
 *                   type: object
 *                   properties:
 *                     method:
 *                       type: string
 *                       enum: [wallet, bank_transfer, credit_card]
 *                     status:
 *                       type: string
 *                       enum: [pending, paid, failed, refunded]
 *                     transactionId:
 *                       type: string
 *                     paidAt:
 *                       type: string
 *                       format: date-time
 *                 timeline:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                       description:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       updatedBy:
 *                         type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Order not found or access denied
 */
router.get("/profile/orders/:orderId", getOrderDetails);
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
router.put("/profile/orders/:orderId/status", updateOrderStatus);

export default router;
