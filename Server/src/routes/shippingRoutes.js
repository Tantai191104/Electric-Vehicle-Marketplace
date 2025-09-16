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

export default router;


