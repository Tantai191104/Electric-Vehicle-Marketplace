import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { chatFileUpload } from "../middlewares/upload.js";
import { startChat, getMyConversations, postMessage, getMessages, postMessageWithFiles, markAsRead } from "../controllers/chatController.js";

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
router.post("/messages/files", (req, res, next) => {
  console.log('=== MULTER MIDDLEWARE DEBUG ===');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Content-Length:', req.headers['content-length']);
  console.log('================================');
  
  chatFileUpload.array('files', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 50MB per file.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Too many files. Maximum is 10 files.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Unexpected field name for file upload.' });
      }
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    }
    
    console.log('=== MULTER SUCCESS ===');
    console.log('Files received:', req.files ? req.files.length : 0);
    console.log('Body:', req.body);
    console.log('======================');
    
    next();
  });
}, postMessageWithFiles);

/**
 * @swagger
 * /chat/{conversationId}/read:
 *   post:
 *     summary: Mark conversation as read
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation marked as read
 *       500:
 *         description: Server error
 */
router.post("/:conversationId/read", markAsRead);

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


