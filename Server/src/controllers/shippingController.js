import { ghnClient, getGhnHeaders } from "../config/ghn.js";
import { z } from "zod";

const feeBodySchema = z.object({
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

    // Light service only: force service_type_id=2, strip items if any, clamp limits
    const body = { ...parsed.data };
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


