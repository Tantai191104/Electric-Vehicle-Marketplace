import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },

    status: { type: String, enum: ["draft", "signed"], default: "draft" },
    templateName: { type: String, default: "default_sale_template_v1" },

    draftPdfUrl: { type: String, default: null },
    finalPdfUrl: { type: String, default: null },

    buyerSignedAt: { type: Date, default: null },
    sellerSignedAt: { type: Date, default: null },
    signedAt: { type: Date, default: null },

    // Metadata for rendering/signature positions if needed
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

export default mongoose.model("Contract", contractSchema);


