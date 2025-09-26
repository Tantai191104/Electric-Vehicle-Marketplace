import express from "express";
import {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getUserProducts,
  getVehicles,
  getBatteries,
  getMotorcycles,
} from "../controllers/productController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { productUpload } from "../middlewares/upload.js";

const router = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with filtering and pagination
 *     tags: [Products]
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
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [vehicle, battery]
 *         description: Filter by category (vehicle or battery)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
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
 */
router.get("/", listProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /products/vehicles:
 *   get:
 *     summary: Get all vehicle products
 *     tags: [Products]
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
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of vehicle products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VehicleProduct'
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
 */
router.get("/vehicles", getVehicles);

/**
 * @swagger
 * /products/batteries:
 *   get:
 *     summary: Get all battery products
 *     tags: [Products]
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
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of battery products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BatteryProduct'
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
 */
router.get("/batteries", getBatteries);

/**
 * @swagger
 * /products/motorcycles:
 *   get:
 *     summary: Get all motorcycle products
 *     tags: [Products]
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
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of motorcycle products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MotorcycleProduct'
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
 */
router.get("/motorcycles", getMotorcycles);

router.use(authenticate);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, price, category, brand, model, year, condition, length, width, height, weight]
 *             properties:
 *               files:
 *                 type: array
 *                 description: Video (if any) and product images. Video will be prioritized first in the list.
 *                 items:
 *                   type: string
 *                   format: binary
 *               title:
 *                 type: string
 *                 description: "Product title"
 *                 example: "VinFast VF8 2023 - Xe điện SUV 7 chỗ"
 *               description:
 *                 type: string
 *                 description: "Product description"
 *                 example: "Xe điện VinFast VF8 đã qua sử dụng, tình trạng tốt, đầy đủ phụ kiện"
 *               price:
 *                 type: number
 *                 description: "Product price in VND"
 *                 example: 890000000
 *               category:
 *                 type: string
 *                 enum: [vehicle, battery, motorcycle]
 *                 description: "Product category: vehicle (car), battery (battery), motorcycle (motorcycle)"
 *                 example: "vehicle"
 *               brand:
 *                 type: string
 *                 description: "Product brand"
 *                 example: "VinFast"
 *               model:
 *                 type: string
 *                 description: "Product model"
 *                 example: "VF8"
 *               year:
 *                 type: integer
 *                 description: "Manufacturing year"
 *                 example: 2023
 *               condition:
 *                 type: string
 *                 enum: [used, refurbished]
 *                 description: "Product condition: used (used), refurbished (refurbished)"
 *                 example: "used"
 *               length:
 *                 type: integer
 *                 description: "Product length (cm) - used for shipping calculation"
 *                 example: 150
 *               width:
 *                 type: integer
 *                 description: "Product width (cm) - used for shipping calculation"
 *                 example: 60
 *               height:
 *                 type: integer
 *                 description: "Product height (cm) - used for shipping calculation"
 *                 example: 90
 *               weight:
 *                 type: integer
 *                 description: "Product weight (grams) - used for shipping calculation"
 *                 example: 50000
 *               specifications:
 *                 type: object
 *                 description: "Product technical specifications (optional)"
 *                 properties:
 *                   batteryCapacity:
 *                     type: string
 *                     description: "Battery capacity"
 *                     example: "3.5 kWh"
 *                   range:
 *                     type: string
 *                     description: "Driving range"
 *                     example: "203 km"
 *                   chargingTime:
 *                     type: string
 *                     description: "Charging time"
 *                     example: "6-7 giờ"
 *                   power:
 *                     type: string
 *                     description: "Motor power"
 *                     example: "2,500 W"
 *                   maxSpeed:
 *                     type: string
 *                     description: "Maximum speed"
 *                     example: "120 km/h"
 *                   batteryType:
 *                     type: string
 *                     description: "Battery type"
 *                     example: "LFP"
 *                   voltage:
 *                     type: string
 *                     description: "Voltage"
 *                     example: "48V"
 *                   capacity:
 *                     type: string
 *                     description: "Battery capacity"
 *                     example: "34.6 Ah"
 *                   cycleLife:
 *                     type: string
 *                     description: "Cycle life"
 *                     example: "2000 chu kỳ"
 *                   warranty:
 *                     type: string
 *                     description: "Warranty"
 *                     example: "3 năm hoặc 30,000 km"
 *                   compatibility:
 *                     type: string
 *                     description: "Compatibility"
 *                     example: "Tương thích trạm sạc VinFast"
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", productUpload.array('files', 10), createProduct);

/**
 * @swagger
 * /products/my/products:
 *   get:
 *     summary: Get current user's products
 *     tags: [Products]
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
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: User's products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get("/my/products", getUserProducts);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product by ID
 *     tags: [Products]
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
 *             $ref: '#/components/schemas/UpdateProduct'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not product owner
 *       404:
 *         description: Product not found
 */
router.put("/:id", updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product by ID
 *     tags: [Products]
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
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not product owner
 *       404:
 *         description: Product not found
 */
router.delete("/:id", deleteProduct);

export default router;
