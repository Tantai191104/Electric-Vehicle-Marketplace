import { ghnClient, getGhnHeaders } from "../config/ghn.js";
import Product from "../models/Product.js";
import { z } from "zod";
import Order from "../models/Order.js";
import User from "../models/User.js";
import WalletTransaction from "../models/WalletTransaction.js";


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
    body.service_type_id = 2;
    body.length = Math.min(Math.max(Number(body.length), 1), 200);
    body.width = Math.min(Math.max(Number(body.width), 1), 200);
    body.height = Math.min(Math.max(Number(body.height), 1), 200);
    body.weight = Math.min(Math.max(Number(body.weight), 1), 1600000);

    const resp = await ghnClient.post("/v2/shipping-order/fee", body, {
      headers,
      responseType: "text",
      transformResponse: [(x) => x],
    });
    let payload;
    try {
      payload = typeof resp.data === 'string' ? JSON.parse(resp.data) : resp.data;
    } catch (e) {
      return res.status(400).json({
        code: 400,
        message: `Lỗi gọi API: corev2_tenant_order_calculate_fee - ${String(e?.message || 'Phản hồi không phải JSON')}`,
        data: String(resp.data || ''),
      });
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

    // Resolve product info if provided to support wallet check and local order creation
    let productDoc = null;
    let sellerId = b.seller_id || null;
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

    // Require pricing context and pre-check wallet balance BEFORE creating GHN order
    const buyerId = req.user?.sub || req.user?.id;
    let finalAmount = null;
    if (!(typeof unitPrice === 'number' && typeof shippingFee === 'number')) {
      return res.status(400).json({ error: 'Thiếu unit_price hoặc shipping_fee' });
    }
    if (typeof unitPrice === 'number' && typeof shippingFee === 'number') {
      finalAmount = Math.max(0, Math.round(unitPrice) + Math.max(0, Math.round(shippingFee)));
      try {
        const buyer = await User.findById(buyerId).select('wallet');
        if (!buyer) return res.status(404).json({ error: 'Buyer not found' });
        if ((buyer.wallet?.balance || 0) < finalAmount) {
          return res.status(400).json({ error: 'Số dư ví không đủ để thanh toán đơn hàng' });
        }
      } catch (e) {
        return res.status(500).json({ error: 'Không kiểm tra được số dư ví', details: e?.message });
      }
    }
    const body = {
      service_type_id: b.service_type_id ?? 2,
      payment_type_id: b.payment_type_id ?? 2,
      required_note: b.required_note ?? 'KHONGCHOXEMHANG',
      from_name: b.from_name ?? null,
      from_phone: b.from_phone ?? null,
      from_address: b.from_address ?? null,
      from_ward_name: b.from_ward_name ?? null,
      from_district_name: b.from_district_name ?? null,
      from_province_name: b.from_province_name ?? null,
      from_district_id: b.from_district_id ?? null,
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

    const resp = await ghnClient.post('/v2/shipping-order/create', body, {
      headers,
      responseType: 'text',
      transformResponse: [(x) => x],
    });
    let payload;
    try {
      payload = typeof resp.data === 'string' ? JSON.parse(resp.data) : resp.data;
    } catch (e) {
      return res.status(400).json({ code: 400, message: String(resp.data || ''), data: null });
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

