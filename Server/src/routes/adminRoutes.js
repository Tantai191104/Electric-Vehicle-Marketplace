import express from 'express';
import {
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getOrderById,
  getAdminStats,
  getSystemStats,
  getOrdersSummary,
  reportViolation,
  getViolations,
  handleViolation,
  getPlatformRevenue,
  approveProduct,
  rejectProduct,
  getPendingProducts,
} from '../controllers/adminController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { requireAdmin } from '../middlewares/authorize.js';

const router = express.Router();

// All admin routes require authentication and admin role
// Temporarily commenting out to debug - will add per-route instead
// router.use(authenticate, requireAdmin);

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
 *     summary: Get admin dashboard statistics with percentage changes
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 3m, 1y]
 *         description: Predefined time range (7 days, 30 days, 3 months, 1 year)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for custom time range (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for custom time range (ISO format)
 *     responses:
 *       200:
 *         description: Admin statistics with percentage changes compared to previous period
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                       example: 1250
 *                       description: Total number of active users
 *                     totalProducts:
 *                       type: number
 *                       example: 450
 *                       description: Total number of active products
 *                     totalOrders:
 *                       type: number
 *                       example: 320
 *                       description: Total number of orders in time range
 *                     totalRevenue:
 *                       type: number
 *                       example: 15000000
 *                       description: Total revenue in VND
 *                     totalCommission:
 *                       type: number
 *                       example: 750000
 *                       description: Total platform commission in VND
 *                     pendingViolations:
 *                       type: number
 *                       example: 5
 *                       description: Number of pending user violations
 *                     percentageChanges:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: number
 *                           example: 15.5
 *                           description: Percentage change in users compared to previous period
 *                         products:
 *                           type: number
 *                           example: -2.3
 *                           description: Percentage change in products compared to previous period
 *                         orders:
 *                           type: number
 *                           example: 25.0
 *                           description: Percentage change in orders compared to previous period
 *                         revenue:
 *                           type: number
 *                           example: 12.8
 *                           description: Percentage change in revenue compared to previous period
 *                         commission:
 *                           type: number
 *                           example: 12.8
 *                           description: Percentage change in commission compared to previous period
 *                     recentOrders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           buyerId:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           sellerId:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           productId:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                               price:
 *                                 type: number
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                       description: 5 most recent orders
 *                     recentUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           role:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                       description: 5 most recent users
 *       400:
 *         description: Bad request (invalid date or range)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid date range"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/admin/stats', authenticate, requireAdmin, getAdminStats);

/**
 * @swagger
 * /admin/system-stats:
 *   get:
 *     summary: Get system-wide statistics for charts and analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics for dashboard charts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     usersByRole:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "user"
 *                             description: User role
 *                           count:
 *                             type: number
 *                             example: 1200
 *                             description: Number of users with this role
 *                       description: Distribution of users by role
 *                     productsByCategory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "xe-dien"
 *                             description: Product category
 *                           count:
 *                             type: number
 *                             example: 450
 *                             description: Number of products in this category
 *                       description: Distribution of products by category
 *                     ordersByStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "delivered"
 *                             description: Order status
 *                           count:
 *                             type: number
 *                             example: 320
 *                             description: Number of orders with this status
 *                       description: Distribution of orders by status
 *                     revenueByMonth:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: object
 *                             properties:
 *                               year:
 *                                 type: number
 *                                 example: 2024
 *                               month:
 *                                 type: number
 *                                 example: 10
 *                           revenue:
 *                             type: number
 *                             example: 5000000
 *                             description: Total revenue for this month in VND
 *                           count:
 *                             type: number
 *                             example: 45
 *                             description: Number of completed orders this month
 *                       description: Revenue and order count by month (last 12 months)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/admin/system-stats', authenticate, requireAdmin, getSystemStats);

/**
 * @swagger
 * /admin/orders/summary:
 *   get:
 *     summary: Get orders summary statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *         description: Predefined time range (7 days, 30 days, 90 days, 1 year)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for custom time range (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for custom time range (ISO format)
 *     responses:
 *       200:
 *         description: Orders summary statistics with proper order status breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Chờ xử lý", "Đã xác nhận", "Đang vận chuyển", "Đã giao", "Đã hủy", "Đã hoàn tiền"]
 *                       description: Order status categories in Vietnamese (pending, confirmed, shipped, delivered, cancelled, refunded)
 *                     values:
 *                       type: array
 *                       items:
 *                         type: number
 *                       example: [25, 40, 15, 150, 10, 5]
 *                       description: Number of orders for each status [pending, confirmed, shipped, delivered, cancelled, refunded]
 *                     total:
 *                       type: number
 *                       example: 245
 *                       description: Total number of orders
 *                     successRate:
 *                       type: string
 *                       example: "61.2"
 *                       description: Success rate percentage based on delivered orders (formatted to 1 decimal place)
 *                     statusBreakdown:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: number
 *                           example: 25
 *                           description: Number of pending orders
 *                         confirmed:
 *                           type: number
 *                           example: 40
 *                           description: Number of confirmed orders
 *                         shipped:
 *                           type: number
 *                           example: 15
 *                           description: Number of shipped orders
 *                         delivered:
 *                           type: number
 *                           example: 150
 *                           description: Number of delivered orders
 *                         cancelled:
 *                           type: number
 *                           example: 10
 *                           description: Number of cancelled orders
 *                         refunded:
 *                           type: number
 *                           example: 5
 *                           description: Number of refunded orders
 *                       description: Detailed breakdown of orders by status
 *       400:
 *         description: Bad request (invalid date range or format)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid date range"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Admin access required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/admin/orders/summary', authenticate, requireAdmin, getOrdersSummary);

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
router.get('/admin/products/pending', authenticate, requireAdmin, getPendingProducts);

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
router.patch('/admin/products/:id/approve', authenticate, requireAdmin, approveProduct);

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
router.patch('/admin/products/:id/reject', authenticate, requireAdmin, rejectProduct);

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
router.put('/admin/products/:id', authenticate, requireAdmin, updateProduct);

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
router.delete('/admin/products/:id', authenticate, requireAdmin, deleteProduct);

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
router.get('/admin/orders', authenticate, requireAdmin, getAllOrders);

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
router.get('/admin/orders/:id', authenticate, requireAdmin, getOrderById);

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
router.get('/admin/violations', authenticate, requireAdmin, getViolations);

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
router.post('/admin/users/:userId/violations', authenticate, requireAdmin, reportViolation);

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
router.put('/admin/users/:userId/violations/:violationId', authenticate, requireAdmin, handleViolation);

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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRevenue:
 *                           type: number
 *                         totalCommission:
 *                           type: number
 *                         totalOrders:
 *                           type: number
 *                         avgOrderValue:
 *                           type: number
 *                     timeline:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: object
 *                           totalRevenue:
 *                             type: number
 *                           totalCommission:
 *                             type: number
 *                           orderCount:
 *                             type: number
 *                           avgOrderValue:
 *                             type: number
 */
router.get('/admin/revenue', authenticate, requireAdmin, getPlatformRevenue);

export default router;
