import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getUserProducts,
  getVehicles,
  getBatteries,
  getMotorcycles,
  markProductAsSold,
  markProductAsAvailable,
  updateProductContractTemplate,
  getProductContractTemplate,
} from "../controllers/productController.js";
import { getFinalContractByProduct } from "../controllers/contractController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { optionalAuth, requireUser, requireAdmin, requireAuth } from "../middlewares/authorize.js";
import { requireProductManagement } from "../middlewares/checkPurchasePermission.js";
import { requireOwnership } from "../middlewares/checkOwnership.js";
import { productUpload } from "../middlewares/upload.js";
import { enforceListingQuota } from "../middlewares/subscriptionQuota.js";

const router = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with filtering and pagination
 *     description: Sorted by seller subscription priority (pro before free), then by product priorityLevel (high before low), then newest first. If seller has active PRO plan, response priorityLevel is boosted to "high". Responses also include isPriorityBoosted and prioritySource.
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
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [priority, newest]
 *           default: priority
 *         description: Sort by priority (high first) or newest
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, sold]
 *         description: Filter by product status (only active or sold)
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
// Guest, User, Admin can view products (GET /products) - Guest chỉ xem danh sách
router.get("/products", optionalAuth, getProducts);

/**
 * @swagger
 * /products/vehicles:
 *   get:
 *     summary: Get all vehicle products
 *     description: Sorted by seller subscription priority (pro before free), then by product priorityLevel (high before low), then newest first. If seller has active PRO plan, response priorityLevel is boosted to "high". Responses also include isPriorityBoosted and prioritySource.
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
router.get("/products/vehicles", optionalAuth, getVehicles);

/**
 * @swagger
 * /products/batteries:
 *   get:
 *     summary: Get all battery products
 *     description: Sorted by seller subscription priority (pro before free), then by product priorityLevel (high before low), then newest first. If seller has active PRO plan, response priorityLevel is boosted to "high". Responses also include isPriorityBoosted and prioritySource.
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
router.get("/products/batteries", optionalAuth, getBatteries);

/**
 * @swagger
 * /products/motorcycles:
 *   get:
 *     summary: Get all motorcycle products
 *     description: Sorted by seller subscription priority (pro before free), then by product priorityLevel (high before low), then newest first. If seller has active PRO plan, response priorityLevel is boosted to "high". Responses also include isPriorityBoosted and prioritySource.
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
router.get("/products/motorcycles", optionalAuth, getMotorcycles);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     description: Returns a single product. If seller has an active PRO subscription, response priorityLevel is boosted to "high". Also includes isPriorityBoosted and prioritySource.
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
router.get("/products/:id", optionalAuth, getProductById);

// Routes below require authentication

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
 *                 type: number
 *                 description: "Product weight (kg) - used for shipping calculation"
 *                 example: 50
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
// Chỉ User (người bán) có thể tạo sản phẩm, Admin không bán hàng
router.post("/products", authenticate, requireProductManagement, enforceListingQuota, productUpload.array('files', 10), createProduct);

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
// Chỉ User (người bán) có thể xem sản phẩm của mình
router.get("/products/my/products", authenticate, requireProductManagement, getUserProducts);

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
// User chỉ có thể update sản phẩm của mình, Admin có thể update bất kỳ sản phẩm nào
router.put("/products/:id", authenticate, requireAuth, requireOwnership, updateProduct);

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
// User chỉ có thể delete sản phẩm của mình, Admin có thể delete bất kỳ sản phẩm nào
router.delete("/products/:id", authenticate, requireAuth, requireOwnership, deleteProduct);

/**
 * @swagger
 * /products/{id}/mark-sold:
 *   patch:
 *     summary: Đánh dấu sản phẩm đã bán (chỉ chủ sở hữu)
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
 *         description: Sản phẩm đã được đánh dấu là đã bán
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     status:
 *                       type: string
 *       403:
 *         description: Không có quyền đánh dấu sản phẩm này
 *       404:
 *         description: Sản phẩm không tồn tại
 */
// Người bán tự đánh dấu sản phẩm đã bán (bán ở nơi khác)
router.patch("/products/:id/mark-sold", authenticate, requireUser, markProductAsSold);

/**
 * @swagger
 * /products/{id}/mark-available:
 *   patch:
 *     summary: Đánh dấu sản phẩm có thể bán (chỉ chủ sở hữu)
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
 *         description: Sản phẩm đã được đánh dấu là có thể bán
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     status:
 *                       type: string
 *       403:
 *         description: Không có quyền đánh dấu sản phẩm này
 *       404:
 *         description: Sản phẩm không tồn tại
 */
// Người bán có thể đánh dấu sản phẩm chưa bán (nếu muốn bán lại)
router.patch("/products/:id/mark-available", authenticate, requireUser, markProductAsAvailable);

/**
 * @swagger
 * /products/{id}/contract-template:
 *   put:
 *     summary: Update contract template for product (seller only)
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
 *             type: object
 *             properties:
 *               htmlContent:
 *                 type: string
 *                 description: Custom HTML contract template
 *               sellerSignature:
 *                 type: string
 *                 description: Seller signature (base64 PNG)
 *               pdfUrl:
 *                 type: string
 *                 description: URL of seller-signed contract PDF
 *     responses:
 *       200:
 *         description: Template updated
 *       403:
 *         description: Not product owner
 *       404:
 *         description: Product not found
 */
router.put("/products/:id/contract-template", authenticate, requireUser, updateProductContractTemplate);

/**
 * @swagger
 * /products/{id}/contract-template:
 *   get:
 *     summary: Get contract template for product
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
 *         description: Contract template
 *       404:
 *         description: Product not found
 */
router.get("/products/:id/contract-template", getProductContractTemplate);

/**
 * @swagger
 * /products/{id}/final-contract:
 *   get:
 *     summary: Get latest signed contract PDF for a product
 *     description: Returns the latest signed contract for the given product. Falls back to latest draft if a final PDF isn't available.
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
 *         description: Latest contract data
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
 *                     contractId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [draft, signed]
 *                     pdfUrl:
 *                       type: string
 *                       format: uri
 *                     signedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Contract not found or no PDF available
 */
// Get latest (final) contract PDF for a product
router.get("/products/:id/final-contract", getFinalContractByProduct);

export default router;
