import { z } from "zod";

export const createTopupOrderValidation = z.object({
  amount: z.number()
    .int()
    .min(1000, "Số tiền nạp tối thiểu là 1,000 VND")
    .max(50000000, "Số tiền nạp tối đa là 50,000,000 VND"),
  description: z.string()
    .max(200, "Mô tả không được quá 200 ký tự")
    .optional()
});

export const getTopupHistoryValidation = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(['pending', 'processing', 'success', 'failed', 'cancelled']).optional()
});

export const zaloPayCallbackValidation = z.object({
  data: z.string().min(1, "Callback data is required"),
  mac: z.string().min(1, "MAC is required")
});
