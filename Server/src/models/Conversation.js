import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    lastMessage: {
      text: { type: String, default: null },
      sentAt: { type: Date, default: null },
      sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
    }
  },
  { timestamps: true }
);

conversationSchema.index({ buyerId: 1, sellerId: 1, productId: 1 }, { unique: true });

export default mongoose.model("Conversation", conversationSchema);


