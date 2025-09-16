import { z } from "zod";

// Accept multipart form-data where numbers arrive as strings
// Also allow specifications to arrive as a JSON string
const specificationsSchema = z.object({
  batteryCapacity: z.string().optional(),
  range: z.string().optional(),
  chargingTime: z.string().optional(),
  power: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  batteryType: z.string().optional(),
  voltage: z.string().optional(),
  capacity: z.string().optional(),
  cycleLife: z.string().optional(),
  operatingTemperature: z.string().optional(),
  warranty: z.string().optional(),
  compatibility: z.string().optional()
}).optional();

export const createProductValidation = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title cannot exceed 200 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description cannot exceed 2000 characters"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  category: z.enum(["vehicle", "battery"], { message: "Invalid product category" }),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 1),
  condition: z.enum(["new", "used", "refurbished"], { message: "Invalid condition" }),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  specifications: z.preprocess((val) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return {}; }
    }
    return val;
  }, specificationsSchema),
  status: z.enum(["active", "sold", "inactive"]).optional(),
  isFeatured: z.coerce.boolean().optional()
});

export const updateProductValidation = createProductValidation.partial();

export const getProductsValidation = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  category: z.enum(["vehicle", "battery"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  minYear: z.coerce.number().int().min(2000).optional(),
  maxYear: z.coerce.number().int().max(new Date().getFullYear() + 1).optional(),
  condition: z.enum(["new", "used", "refurbished"]).optional(),
  search: z.string().optional(),
  seller: z.string().optional(),
  status: z.enum(["active", "sold", "inactive"]).optional(),
  isFeatured: z.coerce.boolean().optional()
});
