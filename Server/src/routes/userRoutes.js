import express from "express";
import { createUser, loginUser, listUsers, getUserById, updateUser, deleteUser } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireAdmin } from "../middlewares/authorize.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Create a user (admin or public register depending on implementation)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.post("/register", createUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in
 */
router.post("/login", loginUser);

// Routes below require admin authentication (quản lý người dùng)
router.use(authenticate, requireAdmin);

/**
 * @swagger
 * /users/list:
 *   get:
 *     summary: List users (Admin only - for statistics and management)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/list", listUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by id (Admin only - for viewing user details)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 */
router.get("/:id", getUserById);

// Note: Admin không thể update/delete user trực tiếp
// Update user chỉ thông qua /api/admin/users/:id (ban/unban, quản lý vi phạm)
// User tự update profile qua /api/profile/*

export default router;
