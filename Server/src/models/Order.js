import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded", "deposit"], 
      default: "pending" 
    },
    
    shipping: {
      method: { type: String, default: null },
      trackingNumber: { type: String, default: null },
      carrier: { type: String, default: null },
      estimatedDelivery: { type: Date, default: null },
      actualDelivery: { type: Date, default: null },
      ghnShopId: { type: String, default: null } // Store GHN shop ID when order is created
    },
    
    shippingAddress: {
      fullName: { type: String, default: null },
      phone: { type: String, default: null },
      address: { type: String, default: null },
      city: { type: String, default: null },
      province: { type: String, default: null },
      zipCode: { type: String, default: null }
    },
    
    payment: {
      method: { type: String, enum: ["wallet", "bank_transfer", "credit_card"], required: true },
      status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
      transactionId: { type: String, default: null },
      paidAt: { type: Date, default: null }
    },
    
    contract: {
      contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", default: null },
      pdfUrl: { type: String, default: null },
      signedAt: { type: Date, default: null },
      contractNumber: { type: String, default: null }
    },
    
    timeline: [{
      status: { type: String, required: true },
      description: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }],
    
    notes: { type: String, default: null },
    adminNotes: { type: String, default: null }
  },
  { timestamps: true }
);

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `EV${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  
  // Validate shippingAddress only for shipping orders (not in-person)
  if (this.shipping?.method && this.shipping.method !== 'in-person') {
    const requiredFields = ['fullName', 'phone', 'address', 'city', 'province'];
    const missingFields = requiredFields.filter(field => !this.shippingAddress?.[field]);
    
    if (missingFields.length > 0) {
      const err = new Error(`Shipping address incomplete: missing ${missingFields.join(', ')}`);
      err.name = 'ValidationError';
      return next(err);
    }
  }
  
  next();
});

export default mongoose.model("Order", orderSchema);
