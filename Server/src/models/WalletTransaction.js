import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { 
      type: String, 
      enum: ["deposit", "withdraw", "purchase", "refund", "commission", "bonus"], 
      required: true 
    },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
    reference: { type: String, default: null }, // ID giao dịch liên quan
    status: { 
      type: String, 
      enum: ["pending", "completed", "failed", "cancelled"], 
      default: "pending" 
    },
    paymentMethod: { 
      type: String, 
      enum: ["bank_transfer", "credit_card", "e_wallet", "internal"], 
      default: "internal" 
    },
    metadata: {
      bankTransactionId: { type: String, default: null },
      orderId: { type: String, default: null },
      productId: { type: String, default: null }
    }
  },
  { timestamps: true }
);

// Prevent duplicate refund for the same user and order reference
walletTransactionSchema.index({ userId: 1, type: 1, reference: 1 }, { unique: true, sparse: true });

export default mongoose.model("WalletTransaction", walletTransactionSchema);
