import { z } from "zod";

// Schema cho specifications (tương tự product.validation.js)
const vehicleSpecsSchema = z.object({
  batteryCapacity: z.string().optional(),
  range: z.string().optional(),
  chargingTime: z.string().optional(),
  power: z.string().optional(),
  maxSpeed: z.string().optional(),
  warranty: z.string().optional()
}).optional();

const batterySpecsSchema = z.object({
  batteryType: z.string().optional(),
  voltage: z.string().optional(),
  capacity: z.string().optional(),
  cycleLife: z.string().optional(),
  warranty: z.string().optional(),
  compatibility: z.string().optional()
}).optional();

const motorcycleSpecsSchema = z.object({
  batteryCapacity: z.string().optional(),
  range: z.string().optional(),
  chargingTime: z.string().optional(),
  power: z.string().optional(),
  maxSpeed: z.string().optional(),
  compatibility: z.string().optional()
}).optional();

// Validation schema cho request gợi ý giá
export const priceSuggestionValidation = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title cannot exceed 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description cannot exceed 2000 characters"),
  category: z.enum(["vehicle", "battery", "motorcycle"], {
    message: "Invalid category. Choose: vehicle, battery, or motorcycle"
  }),
  brand: z.string().min(1, "Brand is required").max(100, "Brand cannot exceed 100 characters"),
  model: z.string().min(1, "Model is required").max(100, "Model cannot exceed 100 characters"),
  year: z.coerce.number().int().min(2000, "Year must be from 2000 onwards").max(new Date().getFullYear() + 1, "Year cannot exceed current year"),
  condition: z.enum(["used", "refurbished"], {
    message: "Invalid condition. Choose: used or refurbished"
  }),
  specifications: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return {}; }
      }
      return val || {};
    },
    z.union([vehicleSpecsSchema, batterySpecsSchema, motorcycleSpecsSchema])
  ).optional()
});

