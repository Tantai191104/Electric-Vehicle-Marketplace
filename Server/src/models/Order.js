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
      actualDelivery: { type: Date, default: null }
    },
    
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
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
  next();
});

export default mongoose.model("Order", orderSchema);
