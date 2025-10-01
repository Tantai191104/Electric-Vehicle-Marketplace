import express from "express";
import {
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getOrderById,
  getAdminStats,
  getSystemStats,
  reportViolation,
  getViolations,
  handleViolation,
  getPlatformRevenue,
  approveProduct,
  rejectProduct,
  getPendingProducts
} from "../controllers/adminController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireAdmin } from "../middlewares/authorize.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin panel endpoints
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                     totalProducts:
 *                       type: number
 *                     totalOrders:
 *                       type: number
 *                     totalRevenue:
 *                       type: number
 *                     recentOrders:
 *                       type: array
 *                     recentUsers:
 *                       type: array
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get("/stats", getAdminStats);

/**
 * @swagger
 * /admin/system-stats:
 *   get:
 *     summary: Get system-wide statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 */
router.get("/system-stats", getSystemStats);

// User management routes removed - use /api/users/* instead

// User detail route removed - use /api/users/:id instead

// User update route removed - use /api/users/:id instead

// User delete route removed - use /api/users/:id instead

// Admin xét duyệt sản phẩm
/**
 * @swagger
 * /admin/products/pending:
 *   get:
 *     summary: Xem danh sách sản phẩm chờ duyệt (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm chờ duyệt
 */
router.get("/products/pending", getPendingProducts);

/**
 * @swagger
 * /admin/products/{id}/approve:
 *   patch:
 *     summary: Duyệt sản phẩm (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Đã duyệt sản phẩm thành công
 *       404:
 *         description: Sản phẩm không tồn tại
 *       400:
 *         description: Sản phẩm không cần xét duyệt
 */
router.patch("/products/:id/approve", approveProduct);

/**
 * @swagger
 * /admin/products/{id}/reject:
 *   patch:
 *     summary: Từ chối sản phẩm (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Lý do từ chối
 *     responses:
 *       200:
 *         description: Đã từ chối sản phẩm
 *       404:
 *         description: Sản phẩm không tồn tại
 *       400:
 *         description: Sản phẩm không cần xét duyệt
 */
router.patch("/products/:id/reject", rejectProduct);

// Admin không cần xem tất cả sản phẩm, chỉ quản lý khi có vi phạm

// Admin không cần xem chi tiết sản phẩm, chỉ quản lý khi có vi phạm

/**
 * @swagger
 * /admin/products/{id}:
 *   put:
 *     summary: Quản lý sản phẩm khi có vi phạm (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Chỉ có thể set inactive khi có vi phạm
 *     responses:
 *       200:
 *         description: Product status updated (Admin chỉ quản lý vi phạm)
 */
router.put("/products/:id", updateProduct);

/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     summary: Xóa sản phẩm vi phạm (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted (Admin chỉ xóa sản phẩm vi phạm)
 */
router.delete("/products/:id", deleteProduct);

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, cancelled, refunded]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get("/orders", getAllOrders);

/**
 * @swagger
 * /admin/orders/{id}:
 *   get:
 *     summary: Get order by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 */
router.get("/orders/:id", getOrderById);

// Order status update route removed - use /api/profile/orders/:orderId/status instead

/**
 * @swagger
 * /admin/violations:
 *   get:
 *     summary: Get all violations (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, resolved]
 *         description: Filter by status
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by severity
 *     responses:
 *       200:
 *         description: List of violations
 */
router.get("/violations", getViolations);

/**
 * @swagger
 * /admin/users/{userId}/violations:
 *   post:
 *     summary: Report violation for user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - violationType
 *               - description
 *               - severity
 *               - action
 *             properties:
 *               violationType:
 *                 type: string
 *                 enum: [spam, fake_product, fraud, inappropriate, other]
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high]
 *               action:
 *                 type: string
 *                 enum: [warning, suspension, ban]
 *     responses:
 *       200:
 *         description: Violation reported successfully
 */
router.post("/users/:userId/violations", reportViolation);

/**
 * @swagger
 * /admin/users/{userId}/violations/{violationId}:
 *   put:
 *     summary: Handle violation (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: violationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Violation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [warning, suspension, ban]
 *               adminNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Violation handled successfully
 */
router.put("/users/:userId/violations/:violationId", handleViolation);

/**
 * @swagger
 * /admin/revenue:
 *   get:
 *     summary: Get platform revenue report (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, month]
 *           default: month
 *         description: Group by day or month
 *     responses:
 *       200:
 *         description: Platform revenue report
 */
router.get("/revenue", getPlatformRevenue);

export default router;
