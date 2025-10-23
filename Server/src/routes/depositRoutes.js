import express from 'express';
import {
  createVehicleDeposit,
  confirmDepositTransaction,
  cancelDeposit,
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

export default router;
