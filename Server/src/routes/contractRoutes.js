import express from "express";
import multer from "multer";
import { authenticate } from "../middlewares/authenticate.js";
import { requireUser } from "../middlewares/authorize.js";
import { initiateContract, signContract, getContractTemplate, generateDraftPdf } from "../controllers/contractController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Initiate contract (creates draft and marks seller as signed)
/**
 * @swagger
 * /contracts/initiate:
 *   post:
 *     summary: Initiate a purchase contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContractInitiate'
 *     responses:
 *       201:
 *         description: Contract initiated
 */
router.post("/initiate", authenticate, requireUser, initiateContract);

// Sign contract by buyer (upload final signed pdf)
/**
 * @swagger
 * /contracts/sign:
 *   post:
 *     summary: Upload buyer-signed contract PDF
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               contractId:
 *                 type: string
 *               pdf:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Signed
 */
router.post("/sign", authenticate, requireUser, upload.single('pdf'), signContract);

// Get server-side HTML template (seller: đã ký, buyer: chưa ký)
/**
 * @swagger
 * /contracts/template:
 *   get:
 *     summary: Get server-rendered contract HTML template
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: HTML
 */
router.get("/template", authenticate, requireUser, getContractTemplate);

// Generate draft PDF on server and upload to Cloudinary
/**
 * @swagger
 * /contracts/draft:
 *   post:
 *     summary: Generate and upload a draft contract PDF
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContractDraft'
 *     responses:
 *       200:
 *         description: Uploaded draft
 */
router.post("/draft", authenticate, requireUser, generateDraftPdf);

export default router;


