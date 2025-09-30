import { z } from "zod";
import Contract from "../models/Contract.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import PDFDocument from "pdfkit";

function renderContractHtml({ sellerName, buyerName, productTitle, unitPrice }) {
  const price = new Intl.NumberFormat('vi-VN').format(Number(unitPrice) || 0);
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hợp đồng mua bán</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; padding: 24px; line-height: 1.6; }
    h1 { font-size: 20px; margin: 0 0 16px; }
    .row { margin: 12px 0; }
    .signed { color: #10b981; font-weight: 600; }
    .unsigned { color: #ef4444; font-weight: 600; }
    .box { border: 1px dashed #e5e7eb; padding: 12px; border-radius: 8px; }
  </style>
  </head>
  <body>
    <h1>Hợp đồng mua bán</h1>
    <div class="row">Sản phẩm: <strong>${productTitle}</strong></div>
    <div class="row">Giá: <strong>${price} VND</strong></div>
    <div class="row box">Bên bán: <strong>${sellerName}</strong> <span class="signed">(đã ký)</span></div>
    <div class="row box">Bên mua: <strong>${buyerName}</strong> <span class="unsigned">(chưa ký)</span></div>
    <div class="row">Vui lòng ký trên ứng dụng để tiếp tục.</div>
  </body>
  </html>`;
}

export async function getContractTemplate(req, res) {
  try {
    const { product_id, seller_id } = req.query;
    const buyerId = req.user?.sub || req.user?.id;
    if (!product_id) return res.status(400).send('Missing product_id');
    const product = await Product.findById(product_id).select('title price seller');
    if (!product) return res.status(404).send('Product not found');
    const sellerId = seller_id || String(product.seller);
    const seller = await User.findById(sellerId).select('profile.fullName name');
    const buyer = await User.findById(buyerId).select('profile.fullName name');
    const html = renderContractHtml({
      sellerName: seller?.profile?.fullName || seller?.name || 'Người bán',
      buyerName: buyer?.profile?.fullName || buyer?.name || 'Người mua',
      productTitle: product.title,
      unitPrice: Number(product.price) || 0,
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (err) {
    return res.status(500).send('Internal Server Error');
  }
}

export async function generateDraftPdf(req, res) {
  try {
    const { contractId } = req.body;
    if (!contractId) return res.status(400).json({ error: 'Missing contractId' });
    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ error: 'Contract not found' });
    const buyerId = req.user?.sub || req.user?.id;
    if (String(contract.buyerId) !== String(buyerId)) return res.status(403).json({ error: 'Not your contract' });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      const uploaded = await new Promise((resolve) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'contracts', format: 'pdf' }, (err, result) => {
          if (err) return resolve({ success: false, error: err.message });
          resolve({ success: true, url: result.secure_url });
        }).end(buffer);
      });
      if (!uploaded.success) return res.status(500).json({ error: uploaded.error || 'Upload failed' });
      contract.draftPdfUrl = uploaded.url;
      await contract.save();
      return res.json({ success: true, data: { draftPdfUrl: contract.draftPdfUrl } });
    });

    const m = contract.metadata || {};
    const price = new Intl.NumberFormat('vi-VN').format(Number(m.unitPrice) || 0);
    doc.fontSize(20).text('HỢP ĐỒNG MUA BÁN', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Sản phẩm: ${m.productTitle || ''}`);
    doc.text(`Giá: ${price} VND`);
    doc.moveDown();
    doc.text(`Bên bán: ${m.sellerName || ''} (đã ký)`);
    doc.text(`Bên mua: ${m.buyerName || ''} (chưa ký)`);
    doc.moveDown();
    doc.text('Vui lòng ký trên ứng dụng để tiếp tục.');
    doc.end();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

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

    // Expect a PDF uploaded from mobile app as field 'pdf'
    const file = (req.files && req.files[0]) || req.file;
    if (!file) {
      return res.status(400).json({ error: "Missing signed PDF file (field 'pdf')" });
    }

    const uploaded = await new Promise((resolve) => {
      cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'contracts', format: 'pdf' }, (err, result) => {
        if (err) return resolve({ success: false, error: err.message });
        resolve({ success: true, url: result.secure_url });
      }).end(file.buffer);
    });

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


