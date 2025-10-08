import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { 
      type: String, 
      enum: ["vehicle", "battery", "motorcycle"], 
      required: true 
    },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    condition: { 
      type: String, 
      enum: ["used", "refurbished"], 
      required: true 
    },
    images: [{ type: String }],
    // Physical package dimensions/weight for shipping (light service)
    length: { type: Number, required: true }, // cm
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true }, // grams
    // Shipping-related package info is no longer stored on the product
    specifications: {
      batteryCapacity: { type: String },
      range: { type: String },
      chargingTime: { type: String },
      power: { type: String },
      maxSpeed: { type: String },
      batteryType: { type: String },
      voltage: { type: String },
      capacity: { type: String },
      cycleLife: { type: String },
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
      enum: ["pending", "active", "sold", "inactive", "rejected"], 
      default: "pending" 
    },
    // Thông tin xét duyệt
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    // Contract template (seller-customizable)
    contractTemplate: {
      htmlContent: { type: String, default: null },
      sellerSignature: { type: String, default: null }, // base64 PNG
      pdfUrl: { type: String, default: null }, // Seller's signed contract template PDF
      createdAt: { type: Date, default: null }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
