import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { requireAdmin } from '../middlewares/authorize.js';
import {
  createPlan,
  updatePlan,
  listPlans,
  deactivatePlan,
  getActivePlans,
  getMySubscription,
  getMySubscriptionUsage,
  assignPlanToUser,
  getUserSubscriptionById,
} from '../controllers/subscriptionController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Subscription plans and user subscription management
 */

// Public
/**
 * @swagger
 * /subscriptions/active:
 *   get:
 *     summary: Get active subscription plans
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: List of active plans
 */
router.get('/subscriptions/active', getActivePlans);

// User
/**
 * @swagger
 * /subscriptions/me:
 *   get:
 *     summary: Get current user's subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current subscription info
 */
router.get('/subscriptions/me', authenticate, getMySubscription);

/**
 * @swagger
 * /subscriptions/usage:
 *   get:
 *     summary: Get current user's subscription usage summary
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage summary for progress UI
 */
router.get('/subscriptions/usage', authenticate, getMySubscriptionUsage);

// Admin
/**
 * @swagger
 * /admin/subscriptions:
 *   post:
 *     summary: Create a subscription plan
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Plan created
 */
router.post('/admin/subscriptions', authenticate, requireAdmin, createPlan);
/**
 * @swagger
 * /admin/subscriptions:
 *   get:
 *     summary: List subscription plans
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List plans
 */
router.get('/admin/subscriptions', authenticate, requireAdmin, listPlans);
/**
 * @swagger
 * /admin/subscriptions/{id}:
 *   put:
 *     summary: Update a subscription plan
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Plan updated
 */
router.put('/admin/subscriptions/:id', authenticate, requireAdmin, updatePlan);
/**
 * @swagger
 * /admin/subscriptions/{id}:
 *   delete:
 *     summary: Deactivate a subscription plan
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Plan deactivated
 */
router.delete('/admin/subscriptions/:id', authenticate, requireAdmin, deactivatePlan);
/**
 * @swagger
 * /admin/users/{userId}/subscription:
 *   post:
 *     summary: Assign plan to user
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId:
 *                 type: string
 *             required:
 *               - planId
 *     responses:
 *       200:
 *         description: Assigned
 */
router.post('/admin/users/:userId/subscription', authenticate, requireAdmin, assignPlanToUser);

/**
 * @swagger
 * /admin/users/{userId}/subscription:
 *   get:
 *     summary: Get user's subscription by userId (Admin)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current subscription for the user
 */
router.get('/admin/users/:userId/subscription', authenticate, requireAdmin, getUserSubscriptionById);

export default router;


