import { z } from "zod";
import Contract from "../models/Contract.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

// Removed server-side HTML/PDF rendering. Contracts are now rendered and signed fully on client.

const initiateSchema = z.object({
  product_id: z.string(),
  seller_id: z.string().optional(),
});

export async function initiateContract(req, res) {
  try {
    const parsed = initiateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues?.[0]?.message || "Validation error" });
    }
    const buyerId = req.user?.sub || req.user?.id;
    const { product_id, seller_id } = parsed.data;

    const product = await Product.findById(product_id).select("_id seller price title");
    if (!product) return res.status(404).json({ error: "Product not found" });

    const sellerId = seller_id || String(product.seller);
    if (!sellerId) return res.status(400).json({ error: "Missing seller_id" });

    if (String(sellerId) === String(buyerId)) {
      return res.status(400).json({ error: "Bạn không thể mua sản phẩm của chính mình" });
    }

    const seller = await User.findById(sellerId).select("_id profile.fullName name");
    const buyer = await User.findById(buyerId).select("_id profile.fullName name");
    if (!seller || !buyer) return res.status(404).json({ error: "User not found" });

    // Mark seller as pre-signed per business rule (seller shows \"đã ký\")
    const contract = await Contract.create({
      buyerId,
      sellerId,
      productId: product._id,
      status: "draft",
      sellerSignedAt: new Date(),
      metadata: {
        productTitle: product.title,
        unitPrice: Number(product.price) || 0,
        sellerName: seller.profile?.fullName || seller.name,
        buyerName: buyer.profile?.fullName || buyer.name,
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        contractId: contract._id,
        status: contract.status,
        seller: { id: seller._id, name: contract.metadata.sellerName, signed: true },
        buyer: { id: buyer._id, name: contract.metadata.buyerName, signed: false },
        template: {
          name: contract.templateName,
          placeholders: {
            sellerName: contract.metadata.sellerName,
            buyerName: contract.metadata.buyerName,
            productTitle: contract.metadata.productTitle,
            unitPrice: contract.metadata.unitPrice,
          }
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

const signSchema = z.object({
  contractId: z.string(),
  finalUrl: z.string().url().optional(),
});

export async function signContract(req, res) {
  try {
    const parsed = signSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues?.[0]?.message || "Validation error" });
    }
    const buyerId = req.user?.sub || req.user?.id;
    const { contractId } = parsed.data;

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    if (String(contract.buyerId) !== String(buyerId)) {
      return res.status(403).json({ error: "Not your contract" });
    }

    // Expect a finalUrl (client-generated PDF), or a PDF file, or signature data
    const file = (req.files && req.files[0]) || req.file;
    const signatureDataUrl = req.body?.signature || req.body?.signatureDataUrl;
    const finalUrl = req.body?.finalUrl;

    // Fast path: client already uploaded to Cloudinary and gave us public URL
    if (finalUrl && typeof finalUrl === 'string') {
      contract.finalPdfUrl = finalUrl;
      contract.status = 'signed';
      contract.buyerSignedAt = new Date();
      contract.signedAt = new Date();
      await contract.save();
      return res.json({ success: true, data: { contractId: contract._id, status: contract.status, finalPdfUrl: contract.finalPdfUrl } });
    }

    if (!file && !signatureDataUrl) {
      return res.status(400).json({ error: "Missing finalUrl or signed PDF file (field 'pdf') or signature data" });
    }

    // Handle signature insertion using pdf-lib
    let uploaded;

    if (file && !signatureDataUrl) {
      // Direct PDF upload without signature
      uploaded = await new Promise((resolve) => {
        cloudinary.uploader.upload_stream({ 
          resource_type: 'raw', 
          folder: 'contracts', 
          format: 'pdf',
          upload_preset: 'unsigned_contracts'
        }, (err, result) => {
          if (err) return resolve({ success: false, error: err.message });
          resolve({ success: true, url: result.secure_url });
        }).end(file.buffer);
      });
    } else if (signatureDataUrl && contract.draftPdfUrl) {
      // Insert signature into existing PDF using pdf-lib
      try {
        // 1. Load existing PDF from draftPdfUrl
        const existingPdfResponse = await fetch(contract.draftPdfUrl);
        if (!existingPdfResponse.ok) {
          throw new Error('Failed to fetch draft PDF');
        }
        const existingPdfBytes = await existingPdfResponse.arrayBuffer();

        // 2. Load PDF with pdf-lib
        const pdfDoc = await PDFLibDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const lastPage = pages[pages.length - 1];

        // 3. Extract signature base64 and embed as PNG
        if (signatureDataUrl.startsWith('data:image/png')) {
          const base64 = signatureDataUrl.split(',')[1] || '';
          const signatureImage = await pdfDoc.embedPng(base64);

          // 4. Draw signature at specific position (bottom right area)
          const { width: pageWidth, height: pageHeight } = lastPage.getSize();
          const signatureWidth = 150;
          const signatureHeight = 50;

          lastPage.drawImage(signatureImage, {
            x: pageWidth - signatureWidth - 50, // 50px from right edge
            y: 100, // 100px from bottom
            width: signatureWidth,
            height: signatureHeight,
          });
        }

        // 5. Save modified PDF
        const pdfBytes = await pdfDoc.save();

        // 6. Upload to Cloudinary
        uploaded = await new Promise((resolve) => {
          cloudinary.uploader.upload_stream({
            resource_type: 'raw',
            folder: 'contracts',
            format: 'pdf',
            upload_preset: 'unsigned_contracts'
          }, (err, result) => {
            if (err) return resolve({ success: false, error: err.message });
            resolve({ success: true, url: result.secure_url });
          }).end(Buffer.from(pdfBytes));
        });
      } catch (error) {
        console.error('Error processing signature:', error);
        return res.status(500).json({ error: 'Failed to process signature: ' + error.message });
      }
    } else {
      // Fallback: create new PDF with PDFKit (original logic)
      uploaded = await new Promise((resolve) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', async () => {
          const buffer = Buffer.concat(chunks);
          cloudinary.uploader.upload_stream({
            resource_type: 'raw',
            folder: 'contracts',
            format: 'pdf',
            upload_preset: 'unsigned_contracts'
          }, (err, result) => {
            if (err) return resolve({ success: false, error: err.message });
            return resolve({ success: true, url: result.secure_url });
          }).end(buffer);
        });

        const m = contract.metadata || {};
        const price = new Intl.NumberFormat('vi-VN').format(Number(m.unitPrice) || 0);
        doc.fontSize(20).text('HỢP ĐỒNG MUA BÁN', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Sản phẩm: ${m.productTitle || ''}`);
        doc.text(`Giá: ${price} VND`);
        doc.moveDown();
        doc.text(`Bên bán: ${m.sellerName || ''} (đã ký)`);
        doc.text(`Bên mua: ${m.buyerName || ''} (đã ký)`);
        doc.moveDown();
        if (typeof signatureDataUrl === 'string' && signatureDataUrl.startsWith('data:image')) {
          try {
            const base64 = signatureDataUrl.split(',')[1] || '';
            const sigBuffer = Buffer.from(base64, 'base64');
            doc.text('Chữ ký bên mua:', { continued: false });
            doc.moveDown(0.5);
            doc.image(sigBuffer, { width: 200 });
          } catch { }
        } else {
          doc.text('Chữ ký bên mua: (điện tử)', { continued: false });
        }
        doc.end();
      });
    }

    if (!uploaded.success) {
      return res.status(500).json({ error: uploaded.error || "Upload failed" });
    }

    contract.finalPdfUrl = uploaded.url;
    contract.status = 'signed';
    contract.buyerSignedAt = new Date();
    contract.signedAt = new Date();
    await contract.save();

    return res.json({ success: true, data: { contractId: contract._id, status: contract.status, finalPdfUrl: contract.finalPdfUrl } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getContractPdf(req, res) {
  try {
    const { id } = req.params;
    const contract = await Contract.findById(id);
    if (!contract) return res.status(404).send('Not found');
    const url = contract.finalPdfUrl || contract.draftPdfUrl;
    if (!url) return res.status(404).send('No PDF');
    // If URL is already public (type upload), just redirect
    if (/\/(?:image|raw)\/upload\//.test(url)) {
      return res.redirect(url);
    }
    // Otherwise, try to extract publicId from either authenticated or raw URL
    const m = url.match(/\/(?:image|raw)\/(?:upload|authenticated)\/[^/]*\/v\d+\/([^\.]+)\.pdf/);
    const publicId = m ? m[1] : null;
    if (!publicId) return res.redirect(url);
    const expiresAt = Math.floor(Date.now() / 1000) + 300;
    const signedUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
      resource_type: /\/raw\//.test(url) ? 'raw' : 'image',
      type: 'authenticated',
      expires_at: expiresAt,
      secure: true,
    });
    return res.redirect(signedUrl);
  } catch (err) {
    return res.status(500).send('Internal Server Error');
  }
}

// Get final contract PDF URL by product id
export async function getFinalContractByProduct(req, res) {
  try {
    const { id } = req.params; // product id
    if (!id) return res.status(400).json({ error: "Missing product id" });

    // Prefer signed contracts, latest first. Fallback to latest draft with draftPdfUrl if any
    const signed = await Contract.findOne({ productId: id, status: 'signed' })
      .sort({ signedAt: -1, updatedAt: -1, createdAt: -1 })
      .lean();
    const draft = !signed
      ? await Contract.findOne({ productId: id })
          .sort({ updatedAt: -1, createdAt: -1 })
          .lean()
      : null;

    const chosen = signed || draft;
    if (!chosen) return res.status(404).json({ error: "Contract not found" });

    const pdfUrl = chosen.finalPdfUrl || chosen.draftPdfUrl || null;
    if (!pdfUrl) return res.status(404).json({ error: "No PDF available" });

    return res.json({
      success: true,
      data: {
        contractId: String(chosen._id),
        status: chosen.status,
        pdfUrl,
        signedAt: chosen.signedAt || null,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}


