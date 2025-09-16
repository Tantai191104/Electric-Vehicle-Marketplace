import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { calcShippingFee } from "../controllers/shippingController.js";

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
 *     summary: Calculate shipping fee via GHN
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
 *               service_type_id:
 *                 type: integer
 *                 default: 2
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
 *                 default: 200
 *               width:
 *                 type: integer
 *                 default: 200
 *               height:
 *                 type: integer
 *                 default: 200
 *               weight:
 *                 type: integer
 *                 default: 1600000
 *               insurance_value:
 *                 type: integer
 *                 default: 5000000
 *               cod_value:
 *                 type: integer
 *                 default: 0
 *               coupon:
 *                 nullable: true
 *                 type: string
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

export default router;


