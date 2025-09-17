import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export async function startConversation(buyerId, sellerId, productId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let convo = await Conversation.findOne({ buyerId, sellerId, productId }).session(session);
    if (!convo) {
      convo = await Conversation.create([{ buyerId, sellerId, productId }], { session });
      convo = convo[0];
    }
    await session.commitTransaction();
    return convo;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export async function listConversations(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const filter = { $or: [{ buyerId: userId }, { sellerId: userId }] };
  const [items, total] = await Promise.all([
    Conversation.find(filter)
      .populate("buyerId", "name email avatar")
      .populate("sellerId", "name email avatar")
      .populate("productId", "title images price")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Conversation.countDocuments(filter),
  ]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function sendMessage(conversationId, senderId, text, files = []) {
  const messageType = files.length > 0 ? (files.some(f => f.type?.startsWith('image/')) ? 'image' : 'file') : 'text';
  const message = await Message.create({ 
    conversationId, 
    senderId, 
    text, 
    type: messageType,
    files: files
  });
  await Conversation.findByIdAndUpdate(conversationId, {
    $set: {
      lastMessage: { text, sentAt: new Date(), sentBy: senderId },
      updatedAt: new Date(),
    },
  });
  return message;
}

export async function listMessages(conversationId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Message.countDocuments({ conversationId });
  return { items: messages.reverse(), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}


