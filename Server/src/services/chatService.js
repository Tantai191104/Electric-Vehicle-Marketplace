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
  
  // Calculate unread count for each conversation
  const conversationsWithUnread = items.map(conversation => {
    const isBuyer = conversation.buyerId._id.toString() === userId;
    const unreadCount = isBuyer ? conversation.unreadCount : conversation.unreadCount;
    
    return {
      ...conversation.toObject(),
      unreadCount: unreadCount || 0
    };
  });
  
  return { items: conversationsWithUnread, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function sendMessage(conversationId, senderId, text = '', files = []) {
  console.log('=== SEND MESSAGE DEBUG ===');
  console.log('conversationId:', conversationId);
  console.log('senderId:', senderId);
  console.log('text:', text);
  console.log('files:', files);
  console.log('files length:', files.length);
  
  // Determine message type based on content
  let messageType = 'text';
  if (files && files.length > 0) {
    messageType = files.some(f => f.type?.startsWith('image/')) ? 'image' : 'file';
  }
  
  console.log('messageType:', messageType);
  
  const message = await Message.create({ 
    conversationId, 
    senderId, 
    text: text || '', 
    type: messageType,
    files: files || []
  });
  
  console.log('Created message:', message);
  
  // Get conversation to determine who should get unread count
  const conversation = await Conversation.findById(conversationId);
  if (conversation) {
    // Determine who should get the unread count (the other participant)
    const recipientId = conversation.buyerId.toString() === senderId ? conversation.sellerId : conversation.buyerId;
    
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        lastMessage: { text, sentAt: new Date(), sentBy: senderId },
        updatedAt: new Date(),
      },
      $inc: {
        unreadCount: 1 // Increment unread count for the recipient
      }
    });
  }
  
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

export async function markConversationAsRead(conversationId, userId) {
  // Mark all messages in the conversation as read for this user
  await Message.updateMany(
    { 
      conversationId, 
      senderId: { $ne: userId }, // Only mark messages from other users as read
      isRead: false 
    },
    { isRead: true }
  );
  
  // Update conversation's unread count to 0
  await Conversation.findByIdAndUpdate(conversationId, {
    $set: {
      unreadCount: 0,
      updatedAt: new Date()
    }
  });
  
  return { success: true };
}


