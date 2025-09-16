import { ghnClient, getGhnHeaders } from "../config/ghn.js";
import { z } from "zod";

const feeBodySchema = z.object({
  service_type_id: z.coerce.number().default(2),
  from_district_id: z.coerce.number(),
  from_ward_code: z.string(),
  to_district_id: z.coerce.number(),
  to_ward_code: z.string(),
  length: z.coerce.number().min(1).default(200),
  width: z.coerce.number().min(1).default(200),
  height: z.coerce.number().min(1).default(200),
  weight: z.coerce.number().min(1).default(1600000),
  insurance_value: z.coerce.number().default(5000000),
  cod_value: z.coerce.number().default(0),
  coupon: z.string().nullable().optional(),
});

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
    const { data } = await ghnClient.post("/v2/shipping-order/fee", parsed.data, { headers });
    return res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data || { error: err.message };
    return res.status(status).json(message);
  }
}


