import express from 'express';
import { getPriceSuggestion } from '../controllers/priceSuggestionController.js';

const router = express.Router();

/**
 * @swagger
 * /products/suggest-price:
 *   post:
 *     summary: Get AI price suggestion for a product draft
 *     description: Analyze product information and get AI-powered price suggestion before creating the listing. Supports automatic failover between multiple Gemini API keys.
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category, brand, model, year, condition]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 description: "Product title"
 *                 example: "VinFast VF8 2023 - Xe điện SUV 7 chỗ"
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: "Product description"
 *                 example: "Xe điện VinFast VF8 đã qua sử dụng, tình trạng tốt, đầy đủ phụ kiện"
 *               category:
 *                 type: string
 *                 enum: [vehicle, battery, motorcycle]
 *                 description: "Product category: vehicle (car), battery (battery), motorcycle (motorcycle)"
 *                 example: "vehicle"
 *               brand:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: "Product brand"
 *                 example: "VinFast"
 *               model:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: "Product model"
 *                 example: "VF8"
 *               year:
 *                 type: integer
 *                 minimum: 2000
 *                 description: "Manufacturing year"
 *                 example: 2023
 *               condition:
 *                 type: string
 *                 enum: [used, refurbished]
 *                 description: "Product condition: used (used), refurbished (refurbished)"
 *                 example: "used"
 *               specifications:
 *                 type: object
 *                 description: "Optional technical specifications"
 *                 properties:
 *                   batteryCapacity:
 *                     type: string
 *                     example: "3.5 kWh"
 *                   range:
 *                     type: string
 *                     example: "203 km"
 *                   chargingTime:
 *                     type: string
 *                     example: "6-7 giờ"
 *                   power:
 *                     type: string
 *                     example: "2,500 W"
 *                   maxSpeed:
 *                     type: string
 *                     example: "120 km/h"
 *                   batteryType:
 *                     type: string
 *                     example: "LFP"
 *                   voltage:
 *                     type: string
 *                     example: "48V"
 *                   capacity:
 *                     type: string
 *                     example: "34.6 Ah"
 *                   cycleLife:
 *                     type: string
 *                     example: "2000 chu kỳ"
 *                   warranty:
 *                     type: string
 *                     example: "3 năm hoặc 30,000 km"
 *                   compatibility:
 *                     type: string
 *                     example: "Tương thích trạm sạc VinFast"
 *     responses:
 *       200:
 *         description: Price suggestion received successfully
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
 *                     suggestedPrice:
 *                       type: number
 *                       description: "Recommended price in VND"
 *                       example: 890000000
 *                     priceRange:
 *                       type: object
 *                       properties:
 *                         low:
 *                           type: number
 *                           example: 750000000
 *                         recommended:
 *                           type: number
 *                           example: 890000000
 *                         high:
 *                           type: number
 *                           example: 1050000000
 *                     reasoning:
 *                       type: object
 *                       properties:
 *                         low:
 *                           type: string
 *                           example: "Giá này phù hợp nếu bạn muốn bán nhanh..."
 *                         recommended:
 *                           type: string
 *                           example: "Đây là mức giá hợp lý dựa trên..."
 *                         high:
 *                           type: string
 *                           example: "Có thể đặt giá cao hơn nếu sản phẩm..."
 *                     marketAnalysis:
 *                       type: string
 *                       example: "Trên thị trường hiện tại..."
 *                     factors:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Thương hiệu VinFast có độ nhận diện cao", "Model 2023 còn khá mới"]
 *                     tips:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Nên bao gồm ảnh chất lượng để tăng giá trị", "Liệt kê đầy đủ phụ kiện đi kèm"]
 *                     warnings:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: "Warnings about data inconsistencies or issues"
 *                       example: []
 *                     dataQuality:
 *                       type: object
 *                       properties:
 *                         isConsistent:
 *                           type: boolean
 *                           description: "Whether title, brand, and model are consistent"
 *                           example: true
 *                         detectedBrand:
 *                           type: string
 *                           nullable: true
 *                           description: "Brand detected from title (if different from input)"
 *                           example: null
 *                         detectedModel:
 *                           type: string
 *                           nullable: true
 *                           description: "Model detected from title (if different from input)"
 *                           example: null
 *                         recommendation:
 *                           type: string
 *                           nullable: true
 *                           description: "Recommendation to fix data if inconsistent"
 *                           example: null
 *       400:
 *         description: Validation error or missing required fields
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
 *                   example: "Title must be at least 5 characters"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *       503:
 *         description: Service unavailable - No API keys configured or all keys exceeded quota
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
 *                   example: "Price suggestion service is temporarily unavailable"
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error or Gemini API error
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
 *                 message:
 *                   type: string
 */
router.post('/products/suggest-price', getPriceSuggestion);

export default router;

