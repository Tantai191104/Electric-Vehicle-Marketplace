import { ghnClient, getGhnHeaders } from "../config/ghn.js";
import Product from "../models/Product.js";
import { z } from "zod";
import Order from "../models/Order.js";
import Contract from "../models/Contract.js";
import User from "../models/User.js";
import WalletTransaction from "../models/WalletTransaction.js";
import { sendBuyerOrderConfirmation, sendSellerOrderNotification } from "../services/emailService.js";


const feeBodySchema = z.object({
  product_id: z.string().optional(),
  service_type_id: z.coerce.number().default(2),
  from_district_id: z.coerce.number(),
  from_ward_code: z.string(),
  to_district_id: z.coerce.number(),
  to_ward_code: z.string(),
  length: z.coerce.number().int().min(1).max(200).default(150),
  width: z.coerce.number().int().min(1).max(200).default(60),
  height: z.coerce.number().int().min(1).max(200).default(90),
  weight: z.coerce.number().int().min(1).max(1600000).default(50000),
  insurance_value: z.coerce.number().default(5000000),
  cod_value: z.coerce.number().default(0),
  coupon: z.string().nullable().optional(),
}).transform((val) => ({
  // Force light service (2) and drop any items if provided
  ...val,
  service_type_id: 2,
}));

export async function calcShippingFee(req, res) {
  try {
    const parsed = feeBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues?.[0]?.message || "Validation error",
        details: parsed.error.issues,
      });
    }
    const headers = getGhnHeaders();

    // Light service only. If product_id is provided, prefer dimensions from product
    const body = { ...parsed.data };
    if (body.product_id) {
      try {
        const prod = await Product.findById(body.product_id).select("length width height weight");
        if (prod) {
          if (typeof prod.length === 'number') body.length = prod.length;
          if (typeof prod.width === 'number') body.width = prod.width;
          if (typeof prod.height === 'number') body.height = prod.height;
          if (typeof prod.weight === 'number') body.weight = prod.weight;
        }
      } catch {}
      delete body.product_id;
    }
    delete body.items;
    // GHN API expects 'service_id' and 'service_type_id' (with underscores)
    // We'll resolve a valid service_id for this route to avoid "route not found service"
    body.service_type_id = 2;

    // Try to resolve available services for the given route and pick a valid service_id
    try {
      const svcResp = await ghnClient.post(
        "/v2/shipping-order/available-services",
        {
          shop_id: Number(process.env.GHN_SHOP_ID),
          from_district: Number(body.from_district_id),
          to_district: Number(body.to_district_id),
        },
        { headers }
      );
      let svcPayload;
      try { svcPayload = typeof svcResp.data === 'string' ? JSON.parse(svcResp.data) : svcResp.data; } catch { svcPayload = {}; }
      const services = Array.isArray(svcPayload?.data) ? svcPayload.data : [];
      const preferred = services.find((s) => Number(s.service_type_id) === 2) || services[0];
      if (preferred && preferred.service_id) {
        body.service_id = Number(preferred.service_id);
      }
    } catch {}
    body.length = Math.min(Math.max(Number(body.length), 1), 200);
    body.width = Math.min(Math.max(Number(body.width), 1), 200);
    body.height = Math.min(Math.max(Number(body.height), 1), 200);
    body.weight = Math.min(Math.max(Number(body.weight), 1), 1600000);

    // Debug: Log the request body being sent to GHN
    console.log('GHN Fee Request Body:', JSON.stringify(body, null, 2));

    const resp = await ghnClient.post("/v2/shipping-order/fee", body, {
      headers,
      responseType: "text",
      transformResponse: [(x) => x],
    });
    let payload;
    try {
      payload = typeof resp.data === 'string' ? JSON.parse(resp.data) : resp.data;
    } catch (e) {
      // Cloudflare challenge returns HTML; detect and map to 502
      const text = String(resp.data || '');
      if (/<!DOCTYPE html>/i.test(text) && /Just a moment/i.test(text)) {
        return res.status(502).json({ code: 502, message: 'GATEWAY_BLOCKED: Cloudflare challenge khi gọi GHN', data: null });
      }
      return res.status(400).json({ code: 400, message: `Lỗi gọi API: corev2_tenant_order_calculate_fee - ${String(e?.message || 'Phản hồi không phải JSON')}`, data: text });
    }
    // Some environments wrap JSON into a JSON string; attempt a second parse if needed
    if (payload && typeof payload.message === 'string') {
      const msg = payload.message.trim();
      if ((msg.startsWith('{') && msg.endsWith('}')) || (msg.startsWith('[') && msg.endsWith(']'))) {
        try {
          const inner = JSON.parse(msg);
          // If inner has standard shape { code, message, data }, unwrap it
          if (inner && typeof inner === 'object' && ('message' in inner || 'data' in inner)) {
            payload = inner;
          }
        } catch {}
      }
    }
    return res.json(payload);
  } catch (err) {
    const status = err.response?.status || 500;
    // Attempt to surface raw text when GHN returns non-JSON error
    const raw = err.response?.data;
    if (typeof raw === 'string') {
      if (/<!DOCTYPE html>/i.test(raw) && /Just a moment/i.test(raw)) {
        return res.status(502).json({ code: 502, message: 'GATEWAY_BLOCKED: Cloudflare challenge khi gọi GHN', data: null });
      }
      let msg = raw;
      try {
        const inner = JSON.parse(raw);
        if (inner && typeof inner === 'object') {
          // If GHN returned a JSON string inside message, unwrap
          if (typeof inner.message === 'string') {
            const im = inner.message.trim();
            if ((im.startsWith('{') && im.endsWith('}')) || (im.startsWith('[') && im.endsWith(']'))) {
              try {
                const imj = JSON.parse(im);
                return res.status(status).json(imj);
              } catch {}
            }
          }
          return res.status(status).json(inner);
        }
      } catch {}
      return res.status(status).json({ code: status, message: msg, data: null });
    }
    const message = err.response?.data || { error: err.message };
    return res.status(status).json(message);
  }
}

// Create GHN order (light service) with minimal fields
const createOrderSchema = z.object({
  // Optional commerce fields to create local order and handle wallet payment
  product_id: z.string().optional(),
  seller_id: z.string().optional(),
  unit_price: z.coerce.number().int().optional(),
  shipping_fee: z.coerce.number().int().optional(),
  // From (seller). If omitted, GHN will use ShopId store defaults
  from_name: z.string().optional(),
  from_phone: z.string().optional(),
  from_address: z.string().optional(),
  from_ward_name: z.string().optional(),
  from_district_name: z.string().optional(),
  from_province_name: z.string().optional(),
  to_name: z.string().min(1),
  to_phone: z.string().min(6),
  to_address: z.string().min(5),
  to_ward_name: z.string().min(1),
  to_district_name: z.string().min(1),
  to_province_name: z.string().min(1),
  length: z.coerce.number().int().min(1).max(200),
  width: z.coerce.number().int().min(1).max(200),
  height: z.coerce.number().int().min(1).max(200),
  weight: z.coerce.number().int().min(1).max(1600000),
  // Optional overrides
  service_type_id: z.coerce.number().int().optional(),
  payment_type_id: z.coerce.number().int().optional(),
  insurance_value: z.coerce.number().int().optional(),
  cod_amount: z.coerce.number().int().optional(),
  required_note: z.string().optional(),
  note: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  coupon: z.string().nullable().optional(),
  client_order_code: z.string().nullable().optional(),
  return_phone: z.string().nullable().optional(),
  return_address: z.string().nullable().optional(),
  return_district_id: z.coerce.number().int().nullable().optional(),
  return_ward_code: z.string().nullable().optional(),
  pick_station_id: z.coerce.number().int().nullable().optional(),
  deliver_station_id: z.coerce.number().int().nullable().optional(),
  pickup_time: z.coerce.number().int().nullable().optional(),
  pick_shift: z.array(z.coerce.number().int()).nullable().optional(),
  items: z.array(z.object({
    name: z.string(),
    code: z.string().optional(),
    quantity: z.coerce.number().int().min(1),
    price: z.coerce.number().int().optional(),
    length: z.coerce.number().int().optional(),
    width: z.coerce.number().int().optional(),
    height: z.coerce.number().int().optional(),
    weight: z.coerce.number().int().optional(),
    category: z.object({ level1: z.string().optional(), level2: z.string().optional(), level3: z.string().optional() }).optional()
  })).optional(),
});

export async function createShippingOrder(req, res) {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues?.[0]?.message || "Validation error",
        details: parsed.error.issues,
      });
    }
    const headers = getGhnHeaders();
    const b = parsed.data;

    // Debug logging: raw request body to help diagnose address/ward issues
    try {
      console.log('[SHIPPING][ORDER][REQ] raw body =', JSON.stringify(req.body));
      console.log('[SHIPPING][ORDER][REQ] parsed body =', JSON.stringify(b));
    } catch {}

    // Resolve product info if provided to support wallet check and local order creation
    let productDoc = null;
    let sellerId = b.seller_id || null;
    let sellerDoc = null;
    let sellerAddr = null;
    let unitPrice = typeof b.unit_price === 'number' ? b.unit_price : null;
    let shippingFee = typeof b.shipping_fee === 'number' ? b.shipping_fee : null;
    if (b.product_id) {
      try {
        productDoc = await Product.findById(b.product_id).select("_id seller price title");
        if (productDoc) {
          if (unitPrice === null || Number.isNaN(unitPrice)) unitPrice = Number(productDoc.price) || 0;
          if (!sellerId && productDoc.seller) sellerId = String(productDoc.seller);
        }
      } catch {}
    }
    // Resolve seller info/address for sender fields
    if (sellerId) {
      try {
        sellerDoc = await User.findById(sellerId).select('name email phone profile.address');
        sellerAddr = sellerDoc?.profile?.address || sellerDoc?.address || null;
      } catch {}
    }

    // Require pricing context and pre-check wallet balance BEFORE creating GHN order
    const buyerId = req.user?.sub || req.user?.id;
    let finalAmount = null;
    if (!(typeof unitPrice === 'number' && typeof shippingFee === 'number')) {
      return res.status(400).json({ error: 'Thiếu unit_price hoặc shipping_fee' });
    }
    if (typeof unitPrice === 'number' && typeof shippingFee === 'number') {
      finalAmount = Math.max(0, Math.round(unitPrice) + Math.max(0, Math.round(shippingFee)));
      try {
        const buyer = await User.findById(buyerId).select('wallet email name phone preferences');
        if (!buyer) return res.status(404).json({ error: 'Buyer not found' });
        if ((buyer.wallet?.balance || 0) < finalAmount) {
          return res.status(400).json({ error: 'Số dư ví không đủ để thanh toán đơn hàng' });
        }
      } catch (e) {
        return res.status(500).json({ error: 'Không kiểm tra được số dư ví', details: e?.message });
      }
    }
    const body = {
      service_id: b.service_type_id ?? 2,
      service_type_id: b.service_type_id ?? 2,
      payment_type_id: b.payment_type_id ?? 2,
      required_note: b.required_note ?? 'KHONGCHOXEMHANG',
      from_name: b.from_name ?? (sellerDoc?.name || null),
      from_phone: b.from_phone ?? (sellerDoc?.phone || null),
      from_address: b.from_address ?? (sellerAddr?.houseNumber || null),
      from_ward_name: b.from_ward_name ?? (sellerAddr?.ward || null),
      from_district_name: b.from_district_name ?? (sellerAddr?.district || null),
      from_province_name: b.from_province_name ?? (sellerAddr?.province || null),
      // Prefer codes if FE/DB has them to avoid mismatch with GHN
      from_ward_code: b.from_ward_code ?? (sellerAddr?.wardCode ? String(sellerAddr.wardCode) : undefined),
      from_district_id: b.from_district_id ?? (sellerAddr?.districtCode ? Number(sellerAddr.districtCode) : undefined),
      to_name: b.to_name,
      to_phone: b.to_phone,
      to_address: b.to_address,
      to_ward_name: b.to_ward_name,
      to_district_name: b.to_district_name,
      to_province_name: b.to_province_name,
      cod_amount: b.cod_amount ?? 0,
      insurance_value: b.insurance_value ?? 0,
      // dimensions
      length: b.length,
      width: b.width,
      height: b.height,
      weight: b.weight,
      // defaults
      note: b.note ?? null,
      content: b.content ?? null,
      coupon: b.coupon ?? null,
      client_order_code: b.client_order_code ?? null,
      return_phone: b.return_phone ?? null,
      return_address: b.return_address ?? null,
      return_district_id: b.return_district_id ?? null,
      return_ward_code: b.return_ward_code ?? null,
      pick_station_id: b.pick_station_id ?? null,
      deliver_station_id: b.deliver_station_id ?? null,
      pickup_time: b.pickup_time ?? null,
      pick_shift: b.pick_shift ?? null,
      items: b.items ?? [],
    };

    // Extra debug for resolved sender
    try {
      console.log('[SHIPPING][ORDER][SENDER_RESOLVED]', {
        from_name: body.from_name,
        from_phone: body.from_phone,
        from_address: body.from_address,
        from_ward_name: body.from_ward_name,
        from_district_name: body.from_district_name,
        from_province_name: body.from_province_name,
        from_ward_code: body.from_ward_code,
        from_district_id: body.from_district_id,
      });
    } catch {}

    const resp = await ghnClient.post('/v2/shipping-order/create', body, {
      headers,
      responseType: 'text',
      transformResponse: [(x) => x],
    });
    try { console.log('[SHIPPING][ORDER][GHN][BODY] =>', JSON.stringify(body)); } catch {}
    let payload;
    try {
      payload = typeof resp.data === 'string' ? JSON.parse(resp.data) : resp.data;
    } catch (e) {
      const text = String(resp.data || '');
      if (/<!DOCTYPE html>/i.test(text) && /Just a moment/i.test(text)) {
        return res.status(502).json({ code: 502, message: 'GATEWAY_BLOCKED: Cloudflare challenge khi tạo đơn GHN', data: null });
      }
      return res.status(400).json({ code: 400, message: text, data: null });
    }
    if (payload && typeof payload.message === 'string') {
      const msg = payload.message.trim();
      if ((msg.startsWith('{') && msg.endsWith('}')) || (msg.startsWith('[') && msg.endsWith(']'))) {
        try {
          const inner = JSON.parse(msg);
          if (inner && typeof inner === 'object') payload = inner;
        } catch {}
      }
    }

    // After GHN success, optionally create local order and deduct wallet
    try {
      const data = payload?.data || payload || {};
      const orderCode = data?.order_code || data?.orderCode || null;

      // Only proceed if we have at least product and pricing context
      if (b.product_id && typeof unitPrice === 'number') {
        // Require signed contract before charging and creating order
        const existingSigned = await Contract.findOne({
          buyerId,
          productId: b.product_id,
          status: 'signed'
        }).sort({ createdAt: -1 });
        if (!existingSigned) {
          payload = payload || {};
          payload.error = 'CONTRACT_REQUIRED';
          payload.message = 'Vui lòng ký hợp đồng trước khi tạo đơn hàng';
          return res.status(400).json(payload);
        }
        const fee = typeof shippingFee === 'number' ? shippingFee : 0;
        const totalAmount = Math.max(0, Math.round(unitPrice));
        const finalAmountCalc = totalAmount + Math.max(0, Math.round(fee));

        // Deduct wallet if we pre-validated the balance
        const buyer = await User.findById(buyerId);
        if (buyer) {
          const balanceBefore = buyer.wallet?.balance || 0;
          if (balanceBefore >= finalAmountCalc) {
            buyer.wallet.balance = balanceBefore - finalAmountCalc;
            buyer.wallet.totalSpent = (buyer.wallet?.totalSpent || 0) + finalAmountCalc;
            await buyer.save();

            await WalletTransaction.create({
              userId: buyer._id,
              type: 'purchase',
              amount: finalAmountCalc,
              balanceBefore,
              balanceAfter: buyer.wallet.balance,
              description: `Thanh toán đơn hàng ${orderCode || ''}`.trim(),
              status: 'completed',
              reference: orderCode || undefined,
              metadata: { orderId: orderCode || null, productId: String(b.product_id) }
            });
          }
        }

        // Create local Order record
        const orderDoc = await Order.create({
          orderNumber: orderCode || `GHN-${Date.now()}`,
          buyerId,
          sellerId: sellerId || undefined,
          productId: b.product_id,
          quantity: 1,
          unitPrice: totalAmount,
          totalAmount,
          shippingFee: Math.max(0, Math.round(shippingFee || 0)),
          commission: 0,
          finalAmount: finalAmountCalc,
          status: 'pending',
          shipping: {
            method: 'GHN',
            trackingNumber: orderCode || null,
            carrier: 'GHN',
          },
          shippingAddress: {
            fullName: b.to_name,
            phone: b.to_phone,
            address: b.to_address,
            city: b.to_district_name,
            province: b.to_province_name,
            zipCode: null,
          },
          payment: {
            method: 'wallet',
            status: 'paid',
            transactionId: orderCode || null,
            paidAt: new Date(),
          },
          timeline: [
            { status: 'pending', description: 'Đơn hàng tạo trên GHN', updatedBy: buyerId },
          ],
        });

        // Attach contract info to order and link back
        try {
          if (existingSigned?.finalPdfUrl) {
            orderDoc.contract = orderDoc.contract || {};
            orderDoc.contract.contractId = existingSigned._id;
            orderDoc.contract.pdfUrl = existingSigned.finalPdfUrl;
            orderDoc.contract.signedAt = existingSigned.signedAt || new Date();
            await orderDoc.save();
            existingSigned.orderId = orderDoc._id;
            await existingSigned.save();
          }
        } catch {}

        // Update product status to "sold" when order is created successfully
        await Product.findByIdAndUpdate(b.product_id, { status: 'sold' });

        // Send email notifications to buyer and seller
        try {
          const buyer = await User.findById(buyerId).select('name email');
          const seller = await User.findById(sellerId).select('name email');
          const product = await Product.findById(b.product_id).select('title images').lean();
          
          // Send buyer confirmation email
          if (buyer?.email) {
            await sendBuyerOrderConfirmation({
              buyerEmail: buyer.email,
              buyerName: buyer.name || 'Khách hàng',
              productTitle: product?.title || productDoc?.title || 'Sản phẩm',
              productImage: (product?.images && product.images[0]) || null,
              unitPrice,
              shippingFee: shippingFee || 0,
              totalAmount: finalAmountCalc,
              orderCode: orderCode || orderDoc.orderNumber,
            });
          }

          // Send seller notification email
          if (seller?.email) {
            const buyerAddress = [
              b.to_address,
              b.to_ward_name,
              b.to_district_name,
              b.to_province_name
            ].filter(Boolean).join(', ');

            await sendSellerOrderNotification({
              sellerEmail: seller.email,
              sellerName: seller.name || 'Người bán',
              buyerName: buyer?.name || b.to_name || 'Khách hàng',
              buyerPhone: b.to_phone || 'N/A',
              buyerAddress,
              productTitle: product?.title || productDoc?.title || 'Sản phẩm',
              productImage: (product?.images && product.images[0]) || null,
              unitPrice,
              shippingFee: shippingFee || 0,
              totalAmount: finalAmountCalc,
              orderCode: orderCode || orderDoc.orderNumber,
            });
          }
        } catch (emailError) {
          console.error('Email notification failed (non-fatal):', emailError);
          // Don't fail the order creation if email fails
        }

        // Attach local order info to response
        payload.localOrder = {
          _id: orderDoc._id,
          orderNumber: orderDoc.orderNumber,
        };
      }
    } catch (e) {
      // Non-fatal for shipping API; include warning
      payload = payload || {};
      payload.warning = `Không thể tạo đơn cục bộ/khấu trừ ví: ${e?.message || 'unknown'}`;
    }

    return res.json(payload);
  } catch (err) {
    const status = err.response?.status || 500;
    const raw = err.response?.data;
    if (typeof raw === 'string') {
      if (/<!DOCTYPE html>/i.test(raw) && /Just a moment/i.test(raw)) {
        return res.status(502).json({ code: 502, message: 'GATEWAY_BLOCKED: Cloudflare challenge khi tạo đơn GHN', data: null });
      }
      try { return res.status(status).json(JSON.parse(raw)); } catch { return res.status(status).json({ code: status, message: raw, data: null }); }
    }
    return res.status(status).json(err.response?.data || { error: err.message });
  }
}


// Get GHN order detail by order_code
const detailSchema = z.object({ order_code: z.string().min(1) });
export async function getShippingOrderDetail(req, res) {
  try {
    const parsed = detailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues?.[0]?.message || 'Validation error',
        details: parsed.error.issues,
      });
    }
    const headers = getGhnHeaders();
    const resp = await ghnClient.post('/v2/shipping-order/detail', { order_code: parsed.data.order_code }, {
      headers,
      responseType: 'text',
      transformResponse: [(x) => x],
    });
    let payload;
    try { payload = typeof resp.data === 'string' ? JSON.parse(resp.data) : resp.data; }
    catch { return res.status(400).json({ code: 400, message: String(resp.data || ''), data: null }); }
    if (payload && typeof payload.message === 'string') {
      const msg = payload.message.trim();
      if ((msg.startsWith('{') && msg.endsWith('}')) || (msg.startsWith('[') && msg.endsWith(']'))) {
        try { const inner = JSON.parse(msg); if (inner && typeof inner === 'object') payload = inner; } catch {}
      }
    }
    return res.json(payload);
  } catch (err) {
    const status = err.response?.status || 500;
    const raw = err.response?.data;
    if (typeof raw === 'string') {
      try { return res.status(status).json(JSON.parse(raw)); } catch { return res.status(status).json({ code: status, message: raw, data: null }); }
    }
    return res.status(status).json(err.response?.data || { error: err.message });
  }
}

// Mark GHN order(s) as return (switch-status/return)
const returnSchema = z.object({
  order_codes: z.array(z.string().min(1)).nonempty()
}).or(z.object({ order_code: z.string().min(1) }));

export async function returnShippingOrder(req, res) {
  try {
    const parsed = returnSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues?.[0]?.message || 'Validation error' });
    }
    const headers = getGhnHeaders();
    const order_codes = Array.isArray(parsed.data.order_codes)
      ? parsed.data.order_codes
      : [parsed.data.order_code];

    const resp = await ghnClient.post('/v2/switch-status/return', { order_codes }, {
      headers,
      responseType: 'text',
      transformResponse: [(x) => x],
    });
    let payload;
    try { payload = typeof resp.data === 'string' ? JSON.parse(resp.data) : resp.data; }
    catch { return res.status(400).json({ code: 400, message: String(resp.data || ''), data: null }); }
    if (payload && typeof payload.message === 'string') {
      const msg = payload.message.trim();
      if ((msg.startsWith('{') && msg.endsWith('}')) || (msg.startsWith('[') && msg.endsWith(']'))) {
        try { const inner = JSON.parse(msg); if (inner && typeof inner === 'object') payload = inner; } catch {}
      }
    }
    // Update local order timeline/status to reflect return process (no refund yet)
    try {
      const list = Array.isArray(payload?.data) ? payload.data : [];
      const buyerId = req.user?.sub || req.user?.id;
      for (const item of list) {
        const code = item?.order_code;
        if (!code) continue;
        const orderDoc = await Order.findOne({ $or: [
          { orderNumber: code },
          { 'shipping.trackingNumber': code },
        ] });
        if (!orderDoc) continue;
        if (String(orderDoc.buyerId) !== String(buyerId)) continue;
        // mark as refund in-progress if not already refunded/cancelled
        if (orderDoc.status !== 'refunded' && !String(orderDoc.status).includes('cancel')) {
          orderDoc.timeline.push({ status: 'refund', description: 'Yêu cầu trả hàng', updatedBy: buyerId });
          await orderDoc.save();
        }
      }
    } catch {}

    return res.json(payload);
  } catch (err) {
    const status = err.response?.status || 500;
    const raw = err.response?.data;
    if (typeof raw === 'string') {
      try { return res.status(status).json(JSON.parse(raw)); } catch { return res.status(status).json({ code: status, message: raw, data: null }); }
    }
    return res.status(status).json(err.response?.data || { error: err.message });
  }
}

// Cancel GHN order(s) and process local refund
const cancelSchema = z.object({
  order_codes: z.array(z.string().min(1)).nonempty()
}).or(z.object({ order_code: z.string().min(1) }));

export async function cancelShippingOrder(req, res) {
  try {
    const parsed = cancelSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues?.[0]?.message || 'Validation error' });
    }
    const headers = getGhnHeaders();
    const order_codes = Array.isArray(parsed.data.order_codes)
      ? parsed.data.order_codes
      : [parsed.data.order_code];

    // Call GHN cancel
    const resp = await ghnClient.post('/v2/switch-status/cancel', { order_codes }, {
      headers,
      responseType: 'text',
      transformResponse: [(x) => x],
    });
    let payload;
    try { payload = typeof resp.data === 'string' ? JSON.parse(resp.data) : resp.data; }
    catch { return res.status(400).json({ code: 400, message: String(resp.data || ''), data: null }); }
    if (payload && typeof payload.message === 'string') {
      const msg = payload.message.trim();
      if ((msg.startsWith('{') && msg.endsWith('}')) || (msg.startsWith('[') && msg.endsWith(']'))) {
        try { const inner = JSON.parse(msg); if (inner && typeof inner === 'object') payload = inner; } catch {}
      }
    }

    // Post-process: refund wallet and update local order for successful cancellations
    const buyerId = req.user?.sub || req.user?.id;
    const results = [];
    const list = Array.isArray(payload?.data) ? payload.data : [];
    for (const item of list) {
      const code = item?.order_code;
      const ok = !!item?.result;
      let local = { updated: false, refunded: false };
      try {
        if (ok && code) {
          const orderDoc = await Order.findOne({ $or: [
            { orderNumber: code },
            { 'shipping.trackingNumber': code },
          ] });
          if (orderDoc) {
            // Only allow buyer to trigger refund of their own order
            if (String(orderDoc.buyerId) !== String(buyerId)) {
              results.push({ order_code: code, result: false, message: 'Not your order', local });
              continue;
            }
            if (orderDoc.status !== 'cancelled') {
              orderDoc.status = 'cancelled';
              orderDoc.timeline.push({ status: 'cancelled', description: 'Hủy đơn hàng', updatedBy: buyerId });
              await orderDoc.save();
              local.updated = true;

              // Refund wallet
              const amount = Math.max(0, Number(orderDoc.finalAmount) || 0);
              if (amount > 0) {
                const user = await User.findById(orderDoc.buyerId);
                if (user) {
                  const balanceBefore = user.wallet?.balance || 0;
                  user.wallet.balance = balanceBefore + amount;
                  await user.save();
                  await WalletTransaction.create({
                    userId: user._id,
                    type: 'refund',
                    amount,
                    balanceBefore,
                    balanceAfter: user.wallet.balance,
                    description: 'Hủy đơn hàng - hoàn tiền đã thanh toán',
                    status: 'completed',
                    reference: code,
                    metadata: { orderId: code }
                  });
                  local.refunded = true;
                }
              }
            }
          }
        }
      } catch (e) {
        // continue aggregating, include error message
        results.push({ order_code: code, result: false, message: e?.message || 'Local refund error', local });
        continue;
      }
      results.push({ order_code: code, result: ok, message: item?.message || 'OK', local });
    }

    return res.json({ code: payload?.code ?? 200, message: payload?.message ?? 'Success', data: results });
  } catch (err) {
    const status = err.response?.status || 500;
    const raw = err.response?.data;
    if (typeof raw === 'string') {
      try { return res.status(status).json(JSON.parse(raw)); } catch { return res.status(status).json({ code: status, message: raw, data: null }); }
    }
    return res.status(status).json(err.response?.data || { error: err.message });
  }
}

// Helper: idempotent refund for a single order when returned
async function refundIfEligible(orderDoc, userId) {
  const code = orderDoc?.shipping?.trackingNumber || orderDoc?.orderNumber;
  if (!code) return { refunded: false, reason: 'NO_CODE' };
  if (orderDoc.status === 'refunded') return { refunded: false, reason: 'ALREADY_REFUNDED' };
  // Check existing refund transaction by reference
  const existed = await WalletTransaction.findOne({ userId: orderDoc.buyerId, type: 'refund', reference: code });
  if (existed) {
    if (orderDoc.status !== 'refunded') {
      orderDoc.status = 'refunded';
      orderDoc.timeline.push({ status: 'refunded', description: 'Đã hoàn tiền do trả hàng', updatedBy: userId });
      await orderDoc.save();
    }
    return { refunded: false, reason: 'TX_EXISTS' };
  }
  const amount = Math.max(0, Number(orderDoc.finalAmount) || 0);
  if (amount <= 0) return { refunded: false, reason: 'ZERO_AMOUNT' };
  const user = await User.findById(orderDoc.buyerId);
  if (!user) return { refunded: false, reason: 'USER_NOT_FOUND' };
  const balanceBefore = user.wallet?.balance || 0;
  user.wallet = user.wallet || {};
  user.wallet.balance = balanceBefore + amount;
  await user.save();
  await WalletTransaction.create({
    userId: user._id,
    type: 'refund',
    amount,
    balanceBefore,
    balanceAfter: user.wallet.balance,
    description: 'Hoàn tiền do trả hàng',
    status: 'completed',
    reference: code,
    metadata: { orderId: code }
  });
  orderDoc.status = 'refunded';
  orderDoc.timeline.push({ status: 'refunded', description: 'Đã hoàn tiền do trả hàng', updatedBy: userId });
  await orderDoc.save();
  return { refunded: true };
}

// Sync returns: iterate user's orders, check GHN status, refund once when returned
export async function syncReturnsAndRefunds(req, res) {
  try {
    const buyerId = req.user?.sub || req.user?.id;
    const headers = getGhnHeaders();
    const orders = await Order.find({ buyerId }).select('_id orderNumber status finalAmount shipping buyerId');
    const results = [];
    for (const o of orders) {
      const code = o?.shipping?.trackingNumber || o?.orderNumber;
      if (!code) {
        results.push({ order: o.orderNumber, skipped: true, reason: 'NO_CODE' });
        continue;
      }
      try {
        const resp = await ghnClient.post('/v2/shipping-order/detail', { order_code: code }, { headers, responseType: 'text', transformResponse: [(x) => x] });
        let payload;
        try { payload = typeof resp.data === 'string' ? JSON.parse(resp.data) : resp.data; } catch { payload = {}; }
        const d = payload?.data || payload || {};
        const status = String(d?.status || d?.current_status || '').toLowerCase();
        if (status === 'returned') {
          const r = await refundIfEligible(o, buyerId);
          results.push({ order: code, status, ...r });
        } else if (status === 'return' || status === 'return_transporting' || status === 'return_sorting' || status === 'returning') {
          // mark timeline as refund in-progress
          o.timeline.push({ status: 'refund', description: `Trả hàng (${status})`, updatedBy: buyerId });
          await o.save();
          results.push({ order: code, status, inProgress: true });
        } else {
          results.push({ order: code, status, skipped: true });
        }
      } catch (e) {
        results.push({ order: o.orderNumber, error: e?.message || 'GHN detail error' });
      }
    }
    return res.json({ success: true, results });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

