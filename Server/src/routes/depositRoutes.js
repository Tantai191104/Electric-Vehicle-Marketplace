import express from 'express';
import {
  createVehicleDeposit,
  confirmDepositTransaction,
  cancelDeposit,
  getAllDeposits,
  getDepositAmountConfig,
  updateDepositAmountConfig,
} from '../controllers/depositController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { requireAdmin } from '../middlewares/authorize.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Deposit
 *   description: Vehicle deposit payment endpoints
 */

/**
 * @swagger
 * /deposit/vehicle:
 *   post:
 *     summary: Create vehicle deposit order (500k VND)
 *     description: For vehicle category only - buyer pays 500k deposit, no shipping involved
 *     tags: [Deposit]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - seller_id
 *               - buyer_name
 *               - buyer_phone
 *               - buyer_address
 *             properties:
 *               product_id:
 *                 type: string
 *                 description: Vehicle product ID
 *               seller_id:
 *                 type: string
 *                 description: Seller user ID
 *               buyer_name:
 *                 type: string
 *                 description: Buyer full name
 *               buyer_phone:
 *                 type: string
 *                 description: Buyer phone number
 *               buyer_address:
 *                 type: string
 *                 description: Buyer address
 *     responses:
 *       201:
 *         description: Deposit created successfully
 *       400:
 *         description: Invalid request or insufficient balance
 *       404:
 *         description: Product not found
 */
router.post('/deposit/vehicle', authenticate, createVehicleDeposit);

/**
 * @swagger
 * /deposit/{orderId}/confirm:
 *   patch:
 *     summary: Admin confirms deposit transaction completed
 *     description: After staff verifies both parties completed the transaction
 *     tags: [Deposit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Admin notes about the transaction
 *     responses:
 *       200:
 *         description: Transaction confirmed
 *       400:
 *         description: Order not in deposit status
 *       404:
 *         description: Order not found
 */
router.patch(
  '/deposit/:orderId/confirm',
  authenticate,
  requireAdmin,
  confirmDepositTransaction
);

/**
 * @swagger
 * /deposit/{orderId}/cancel:
 *   patch:
 *     summary: Cancel deposit and refund buyer
 *     description: Used if transaction falls through
 *     tags: [Deposit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Deposit cancelled and refunded
 *       400:
 *         description: Order not in deposit status
 *       404:
 *         description: Order not found
 */
router.patch(
  '/deposit/:orderId/cancel',
  authenticate,
  requireAdmin,
  cancelDeposit
);

/**
 * @swagger
 * /admin/deposits:
 *   get:
 *     summary: Get all deposit orders (Admin only)
 *     description: Admin can view all deposit orders with pagination
 *     tags: [Deposit]
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
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by order number
 *     responses:
 *       200:
 *         description: List of deposit orders
 *       401:
 *         description: Unauthorized
 */
router.get('/admin/deposits', authenticate, requireAdmin, getAllDeposits);

/**
 * @swagger
 * /deposit-amount:
 *   get:
 *     summary: Get current deposit amount configuration
 *     description: Returns the current deposit amount setting (Public endpoint)
 *     tags: [Deposit]
 *     responses:
 *       200:
 *         description: Current deposit amount configuration
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
 *                     amount:
 *                       type: number
 *                       description: Deposit amount in VND
 *                       example: 500000
 *                     description:
 *                       type: string
 *                       description: Description of the deposit
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 */
router.get('/deposit-amount', getDepositAmountConfig);

/**
 * @swagger
 * /admin/deposit-amount:
 *   put:
 *     summary: Update deposit amount configuration (Admin only)
 *     description: Admin can change the deposit amount for vehicles
 *     tags: [Deposit]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: New deposit amount in VND
 *                 example: 1000000
 *                 minimum: 10000
 *               description:
 *                 type: string
 *                 description: Description for the deposit amount
 *                 example: "Vehicle deposit amount - 1M VND"
 *     responses:
 *       200:
 *         description: Deposit amount updated successfully
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
 *                     amount:
 *                       type: number
 *                     description:
 *                       type: string
 *       400:
 *         description: Invalid amount
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/admin/deposit-amount', authenticate, requireAdmin, updateDepositAmountConfig);

export default router;
