import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, default: "" },
    type: { type: String, enum: ["text", "image", "file"], default: "text" },
    files: [{
      url: { type: String, required: true },
      name: { type: String, required: true },
      type: { type: String, required: true }
    }],
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);


