import mongoose from "mongoose";

const walletTopupSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    orderId: { 
      type: String, 
      required: true, 
      unique: true 
    },
    app_trans_id: { 
      type: String, 
      required: true, 
      unique: true 
    },
    zp_trans_token: { 
      type: String, 
      default: null 
    },
    zp_trans_id: { 
      type: String, 
      default: null 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    description: { 
      type: String, 
      default: null 
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'success', 'failed', 'cancelled'],
      default: 'pending'
    },
    payment_method: {
      type: String,
      default: 'zalopay'
    },
    order_url: {
      type: String,
      default: null
    },
    payment_time: {
      type: Date,
      default: null
    },
    callback_data: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    ip_address: {
      type: String,
      default: null
    },
    user_agent: {
      type: String,
      default: null
    }
  },
  { 
    timestamps: true 
  }
);

walletTopupSchema.index({ userId: 1, status: 1 });
walletTopupSchema.index({ app_trans_id: 1 });
walletTopupSchema.index({ orderId: 1 });
walletTopupSchema.index({ createdAt: -1 });

export default mongoose.model("WalletTopup", walletTopupSchema);
