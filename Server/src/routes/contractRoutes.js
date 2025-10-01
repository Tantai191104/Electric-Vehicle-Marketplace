import express from "express";
import multer from "multer";
import { authenticate } from "../middlewares/authenticate.js";
import { requireUser } from "../middlewares/authorize.js";
import { initiateContract, signContract, getContractPdf } from "../controllers/contractController.js";

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

// Sign contract by buyer (client-generated PDF URL or uploaded file)
/**
 * @swagger
 * /contracts/sign:
 *   post:
 *     summary: Finalize contract with buyer-signed PDF
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [contractId]
 *             properties:
 *               contractId:
 *                 type: string
 *                 description: Contract ID to finalize
 *               finalUrl:
 *                 type: string
 *                 format: uri
 *                 description: Public Cloudinary URL of client-generated PDF (preferred). If provided, 'pdf' can be omitted.
 *               pdf:
 *                 type: string
 *                 format: binary
 *                 description: Fallback upload of PDF file if not using finalUrl
 *     responses:
 *       200:
 *         description: Contract finalized
 */
router.post("/sign", authenticate, requireUser, upload.single('pdf'), signContract);

// Template endpoint removed: client renders contract HTML

// Draft generation removed: client generates and uploads PDF directly

// Serve signed Cloudinary URL so clients avoid 401 when accessing authenticated PDFs
/**
 * @swagger
 * /contracts/{id}/pdf:
 *   get:
 *     summary: Get a temporary signed URL to view the contract PDF inline
 *     description: Redirects to a time-limited signed Cloudinary URL for the contract's PDF (draft or final). Requires authentication and ownership (buyer or seller).
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *     responses:
 *       302:
 *         description: Redirect to signed PDF URL
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Contract or PDF not found
 */
// Public access to contract PDF (either public URL or time-limited signed URL)
router.get("/:id/pdf", getContractPdf);

export default router;


