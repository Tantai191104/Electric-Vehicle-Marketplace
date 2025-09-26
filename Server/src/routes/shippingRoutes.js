import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { calcShippingFee, createShippingOrder, getShippingOrderDetail, cancelShippingOrder, returnShippingOrder, syncShippingOrderStatus, syncUserOrders } from "../controllers/shippingController.js";

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Shipping
 *     description: Shipping and delivery related endpoints
 */

/**
 * @swagger
 * /shipping/fee:
 *   post:
 *     summary: Calculate shipping fee via GHN (Light service only)
 *     tags: [Shipping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *                 description: Optional. If provided, server uses product's length/width/height/weight
 *               service_type_id:
 *                 type: integer
 *                 default: 2
 *                 description: Fixed to 2 (Light service)
 *               from_district_id:
 *                 type: integer
 *               from_ward_code:
 *                 type: string
 *               to_district_id:
 *                 type: integer
 *               to_ward_code:
 *                 type: string
 *               length:
 *                 type: integer
 *                 default: 150
 *               width:
 *                 type: integer
 *                 default: 60
 *               height:
 *                 type: integer
 *                 default: 90
 *               weight:
 *                 type: integer
 *                 default: 50000
 *               insurance_value:
 *                 type: integer
 *                 default: 5000000
 *               cod_value:
 *                 type: integer
 *                 default: 0
 *               coupon:
 *                 nullable: true
 *                 type: string
 *           example:
 *             service_type_id: 2
 *             from_district_id: 1442
 *             from_ward_code: "21211"
 *             to_district_id: 1820
 *             to_ward_code: "030712"
 *             length: 30
 *             width: 40
 *             height: 20
 *             weight: 3000
 *             insurance_value: 0
 *             coupon: null
 *     responses:
 *       200:
 *         description: GHN fee response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/fee", calcShippingFee);

/**
 * @swagger
 * /shipping/order:
 *   post:
 *     summary: Create GHN shipping order (Light service, minimal fields)
 *     tags: [Shipping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from_name:
 *                 type: string
 *                 description: Optional. If omitted, GHN uses ShopId store defaults
 *               from_phone:
 *                 type: string
 *               from_address:
 *                 type: string
 *               from_ward_code:
 *                 type: string
 *               from_district_id:
 *                 type: integer
 *               from_ward_name:
 *                 type: string
 *               from_district_name:
 *                 type: string
 *               from_province_name:
 *                 type: string
 *               to_name:
 *                 type: string
 *               to_phone:
 *                 type: string
 *               to_address:
 *                 type: string
 *               to_ward_name:
 *                 type: string
 *               to_district_name:
 *                 type: string
 *               to_province_name:
 *                 type: string
 *               length:
 *                 type: integer
 *               width:
 *                 type: integer
 *               height:
 *                 type: integer
 *               weight:
 *                 type: integer
 *               service_type_id:
 *                 type: integer
 *                 default: 2
 *               payment_type_id:
 *                 type: integer
 *                 default: 2
 *               insurance_value:
 *                 type: integer
 *                 default: 0
 *               cod_amount:
 *                 type: integer
 *                 default: 0
 *               required_note:
 *                 type: string
 *                 default: KHONGCHOXEMHANG
 *               note:
 *                 type: string
 *                 nullable: true
 *               content:
 *                 type: string
 *                 nullable: true
 *               coupon:
 *                 type: string
 *                 nullable: true
 *               client_order_code:
 *                 type: string
 *                 nullable: true
 *               return_phone:
 *                 type: string
 *                 nullable: true
 *               return_address:
 *                 type: string
 *                 nullable: true
 *               return_district_id:
 *                 type: integer
 *                 nullable: true
 *               return_ward_code:
 *                 type: string
 *                 nullable: true
 *               pick_station_id:
 *                 type: integer
 *                 nullable: true
 *               deliver_station_id:
 *                 type: integer
 *                 nullable: true
 *               pickup_time:
 *                 type: integer
 *                 nullable: true
 *               pick_shift:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 nullable: true
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     code:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: integer
 *                     length:
 *                       type: integer
 *                     width:
 *                       type: integer
 *                     height:
 *                       type: integer
 *                     weight:
 *                       type: integer
 *                     category:
 *                       type: object
 *                       properties:
 *                         level1:
 *                           type: string
 *                         level2:
 *                           type: string
 *                         level3:
 *                           type: string
 *           example:
 *             from_name: "Cua hang ABC"
 *             from_phone: "0909000001"
 *             from_address: "39 Nguyen Trai, Q1, HCM"
 *             from_ward_name: "Phường Bến Nghé"
 *             from_district_name: "Quận 1"
 *             from_province_name: "HCM"
 *             to_name: "Nguyen Van A"
 *             to_phone: "0909000000"
 *             to_address: "72 Thành Thái, P14, Q10, TP.HCM"
 *             to_ward_name: "Phường 14"
 *             to_district_name: "Quận 10"
 *             to_province_name: "HCM"
 *             length: 30
 *             width: 40
 *             height: 20
 *             weight: 3000
 *             service_type_id: 2
 *             payment_type_id: 2
 *             insurance_value: 0
 *             cod_amount: 0
 *             required_note: KHONGCHOXEMHANG
 *     responses:
 *       200:
 *         description: GHN order creation response
 */
router.post("/order", createShippingOrder);

/**
 * @swagger
 * /shipping/order/detail:
 *   post:
 *     summary: Get GHN order details by order_code
 *     tags: [Shipping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_code:
 *                 type: string
 *                 example: L3A4NQ
 *     responses:
 *       200:
 *         description: GHN order detail
 */
router.post("/order/detail", getShippingOrderDetail);

/**
 * @swagger
 * /shipping/order/cancel:
 *   post:
 *     summary: Cancel GHN order(s) and refund wallet if applicable
 *     tags: [Shipping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   order_code:
 *                     type: string
 *                     example: "5E3NK3RS"
 *               - type: object
 *                 properties:
 *                   order_codes:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["5E3NK3RS", "ABC123"]
 *     responses:
 *       200:
 *         description: Cancel result and local refund summary
 */
router.post("/order/cancel", cancelShippingOrder);

/**
 * @swagger
 * /shipping/order/return:
 *   post:
 *     summary: Switch GHN order(s) to return status (no refund logic)
 *     tags: [Shipping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   order_code:
 *                     type: string
 *                     example: "5ENLKKHD"
 *               - type: object
 *                 properties:
 *                   order_codes:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["5ENLKKHD"]
 *     responses:
 *       200:
 *         description: Return switch result
 */
router.post("/order/return", returnShippingOrder);

/**
 * @swagger
 * /shipping/order/sync:
 *   post:
 *     summary: Sync GHN status and process wallet refund when returned
 *     tags: [Shipping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_code:
 *                 type: string
 *                 example: "5ENLKKHD"
 *     responses:
 *       200:
 *         description: Sync result and refund status
 */
router.post("/order/sync", syncShippingOrderStatus);

/**
 * @swagger
 * /shipping/order/sync/all:
 *   post:
 *     summary: Sync toàn bộ đơn của user đang đăng nhập và hoàn tiền nếu GHN trả về returned (idempotent)
 *     tags: [Shipping]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kết quả đồng bộ và số đơn đã hoàn tiền
 */
router.post("/order/sync/all", syncUserOrders);

export default router;


