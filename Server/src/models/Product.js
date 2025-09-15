import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { 
      type: String, 
      enum: ["vehicle", "battery"], 
      required: true 
    },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    condition: { 
      type: String, 
      enum: ["new", "used", "refurbished"], 
      required: true 
    },
    images: [{ type: String }],
    specifications: {
      batteryCapacity: { type: String },
      range: { type: String },
      chargingTime: { type: String },
      power: { type: String },
      weight: { type: String },
      dimensions: { type: String },
      batteryType: { type: String },
      voltage: { type: String },
      capacity: { type: String },
      cycleLife: { type: String },
      operatingTemperature: { type: String },
      warranty: { type: String },
      compatibility: { type: String }
    },
    seller: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["active", "sold", "inactive"], 
      default: "active" 
    },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
