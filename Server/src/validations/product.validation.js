import { z } from "zod";

// Category-specific specifications
const vehicleSpecsSchema = z.object({
  batteryCapacity: z.string().optional(),
  range: z.string().optional(),
  chargingTime: z.string().optional(),
  power: z.string().optional(),
  maxSpeed: z.string().optional(),
  batteryType: z.string().optional(),
  voltage: z.string().optional(),
  capacity: z.string().optional(),
  warranty: z.string().optional(),
  compatibility: z.string().optional()
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
  warranty: z.string().optional(),
  compatibility: z.string().optional()
}).optional();

export const createProductValidation = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title cannot exceed 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description cannot exceed 2000 characters"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  category: z.enum(["vehicle", "battery", "motorcycle"], { message: "Invalid product category. Choose: vehicle (car), battery (battery), motorcycle (motorcycle)" }),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().int().min(2000, "Year must be from 2000 onwards").max(new Date().getFullYear() + 1, "Year cannot exceed current year"),
  condition: z.enum(["used", "refurbished"], { message: "Invalid condition. Choose: used (used), refurbished (refurbished)" }),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  // Required shipping dimensions/weight (light service)
  length: z.coerce.number().int().min(1, "Length must be from 1cm onwards").max(600, "Length cannot exceed 600cm"),
  width: z.coerce.number().int().min(1, "Width must be from 1cm onwards").max(300, "Width cannot exceed 300cm"),
  height: z.coerce.number().int().min(1, "Height must be from 1cm onwards").max(250, "Height cannot exceed 250cm"),
  weight: z.coerce.number().min(1, "Weight must be from 1kg onwards").max(1600, "Weight cannot exceed 1,600kg (1.6 tons)"),
  // Category-specific specifications
  specifications: z.preprocess((val) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return {}; }
    }
    return val;
  }, z.union([vehicleSpecsSchema, batterySpecsSchema, motorcycleSpecsSchema])),
  status: z.enum(["active", "sold", "inactive"]).optional(),
  isFeatured: z.coerce.boolean().optional()
});

export const updateProductValidation = createProductValidation.partial();

export const getProductsValidation = z.object({
  page: z.coerce.number().int().min(1, "Page must be from 1 onwards").optional(),
  limit: z.coerce.number().int().min(1, "Limit must be from 1 onwards").max(100, "Limit cannot exceed 100").optional(),
  category: z.enum(["vehicle", "battery", "motorcycle"], { message: "Invalid product category" }).optional(),
  minPrice: z.coerce.number().min(0, "Minimum price cannot be negative").optional(),
  maxPrice: z.coerce.number().min(0, "Maximum price cannot be negative").optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  minYear: z.coerce.number().int().min(2000, "Minimum year must be from 2000 onwards").optional(),
  maxYear: z.coerce.number().int().max(new Date().getFullYear() + 1, "Maximum year cannot exceed current year").optional(),
  condition: z.enum(["used", "refurbished"], { message: "Invalid condition" }).optional(),
  search: z.string().optional(),
  seller: z.string().optional(),
  status: z.enum(["active", "sold", "inactive"], { message: "Invalid status" }).optional(),
  isFeatured: z.coerce.boolean().optional(),
  // Sort mode: 'priority' (default) or 'newest'
  sort: z.enum(["priority", "newest"]).optional()
});
