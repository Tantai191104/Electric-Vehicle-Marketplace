import express from "express";
import {
  createTopupOrder,
  handleZaloPayCallback,
  queryOrderStatus,
  getTopupHistory
} from "../controllers/zalopayController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireUser } from "../middlewares/authorize.js";
import { 
  createTopupOrderValidation, 
  getTopupHistoryValidation,
  zaloPayCallbackValidation 
} from "../validations/zalopay.validation.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TopupOrder:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           minimum: 1000
 *           maximum: 50000000
 *           description: Số tiền nạp (VND)
 *           example: 100000
 *         description:
 *           type: string
 *           maxLength: 200
 *           description: Mô tả giao dịch
 *           example: "Nạp xu vào ví"
 *     TopupResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             orderId:
 *               type: string
 *             app_trans_id:
 *               type: string
 *             amount:
 *               type: number
 *             order_url:
 *               type: string
 *             status:
 *               type: string
 */

/**
 * @swagger
 * /zalopay/create-order:
 *   post:
 *     summary: Tạo đơn hàng nạp tiền ZaloPay
 *     tags: [ZaloPay]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TopupOrder'
 *     responses:
 *       200:
 *         description: Đơn hàng được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopupResponse'
 *       400:
 *         description: Lỗi validation hoặc tạo đơn hàng
 *       401:
 *         description: Không được xác thực
 *       500:
 *         description: Lỗi server
 */
// Chỉ User mới được nạp tiền để mua hàng, Admin không nạp tiền
router.post("/zalopay/create-order", authenticate, requireUser, async (req, res) => {
  try {
    const result = createTopupOrderValidation.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: "Validation error",
        message: result.error.errors[0]?.message || "Dữ liệu không hợp lệ",
        details: result.error.errors 
      });
    }

    req.body = result.data;
    return createTopupOrder(req, res);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      message: "Lỗi xử lý yêu cầu"
    });
  }
});

/**
 * @swagger
 * /zalopay/callback:
 *   post:
 *     summary: Webhook callback từ ZaloPay
 *     tags: [ZaloPay]
 *     description: Endpoint này được ZaloPay gọi khi có thay đổi trạng thái thanh toán
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *               - mac
 *             properties:
 *               data:
 *                 type: string
 *                 description: Dữ liệu callback được mã hóa
 *               mac:
 *                 type: string
 *                 description: Chữ ký MAC để xác thực
 *     responses:
 *       200:
 *         description: Callback xử lý thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return_code:
 *                   type: number
 *                   example: 1
 *                 return_message:
 *                   type: string
 *                   example: "OK"
 *       400:
 *         description: MAC không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post("/zalopay/callback", async (req, res) => {
  try {
    const result = zaloPayCallbackValidation.safeParse(req.body);
    if (!result.success) {
      console.warn('Invalid callback data:', result.error.errors);
      return res.status(400).json({ 
        return_code: -1, 
        return_message: "Invalid callback data" 
      });
    }

    return handleZaloPayCallback(req, res);
  } catch (error) {
    console.error('Callback validation error:', error);
    return res.status(500).json({ 
      return_code: -1, 
      return_message: "Server Error" 
    });
  }
});

/**
 * @swagger
 * /zalopay/order/{orderId}/status:
 *   get:
 *     summary: Kiểm tra trạng thái đơn hàng
 *     tags: [ZaloPay]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đơn hàng
 *         example: "topup_user123_1703123456789_abc12345"
 *     responses:
 *       200:
 *         description: Trạng thái đơn hàng
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
 *                     orderId:
 *                       type: string
 *                     app_trans_id:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     status:
 *                       type: string
 *                       enum: [pending, processing, success, failed, cancelled]
 *                     payment_time:
 *                       type: string
 *                       format: date-time
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       401:
 *         description: Không được xác thực
 *       500:
 *         description: Lỗi server
 */
// Chỉ User mới được kiểm tra trạng thái nạp tiền
router.get("/zalopay/order/:orderId/status", authenticate, requireUser, queryOrderStatus);

/**
 * @swagger
 * /zalopay/history:
 *   get:
 *     summary: Lấy lịch sử nạp tiền của người dùng
 *     tags: [ZaloPay]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Số lượng bản ghi mỗi trang
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, success, failed, cancelled]
 *         description: Lọc theo trạng thái
 *     responses:
 *       200:
 *         description: Lịch sử nạp tiền
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
 *                     topups:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           orderId:
 *                             type: string
 *                           app_trans_id:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           status:
 *                             type: string
 *                           description:
 *                             type: string
 *                           payment_time:
 *                             type: string
 *                             format: date-time
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Không được xác thực
 *       500:
 *         description: Lỗi server
 */
// Chỉ User mới được xem lịch sử nạp tiền
router.get("/zalopay/history", authenticate, requireUser, async (req, res) => {
  try {
    const result = getTopupHistoryValidation.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ 
        error: "Validation error",
        message: result.error.errors[0]?.message || "Tham số không hợp lệ",
        details: result.error.errors 
      });
    }

    req.query = result.data;
    return getTopupHistory(req, res);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      message: "Lỗi xử lý yêu cầu"
    });
  }
});

export default router;
