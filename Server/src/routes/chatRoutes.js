import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { chatFileUpload } from "../middlewares/upload.js";
import { startChat, getMyConversations, postMessage, getMessages, postMessageWithFiles } from "../controllers/chatController.js";

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Buyer-seller chat endpoints
 */

/**
 * @swagger
 * /chat/start:
 *   post:
 *     summary: Start or get existing conversation for a product
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, sellerId]
 *             properties:
 *               productId: { type: string }
 *               sellerId: { type: string }
 *     responses:
 *       201:
 *         description: Conversation
 */
router.post("/start", startChat);

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: List my conversations
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get("/", getMyConversations);

/**
 * @swagger
 * /chat/messages:
 *   post:
 *     summary: Send a text message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [conversationId, text]
 *             properties:
 *               conversationId: { type: string }
 *               text: { type: string }
 *     responses:
 *       201:
 *         description: Message
 */
router.post("/messages", postMessage);

/**
 * @swagger
 * /chat/messages/files:
 *   post:
 *     summary: Send a message with files
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId: { type: string }
 *               text: { type: string }
 *               files: 
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Message with files
 */
router.post("/messages/files", chatFileUpload.array('files', 5), postMessageWithFiles);

/**
 * @swagger
 * /chat/{conversationId}/messages:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: Messages
 */
router.get("/:conversationId/messages", getMessages);

export default router;


