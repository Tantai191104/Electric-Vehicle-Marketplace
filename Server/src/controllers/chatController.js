import { startConversation, listConversations, sendMessage, listMessages, markConversationAsRead } from "../services/chatService.js";
import { startChatValidation, sendMessageValidation, listMessagesValidation } from "../validations/chat.validation.js";
import cloudinary from "../config/cloudinary.js";

export async function startChat(req, res) {
  const { productId, sellerId } = startChatValidation.parse(req.body);
  const buyerId = req.user.sub;
  const convo = await startConversation(buyerId, sellerId, productId);
  res.status(201).json(convo);
}

export async function getMyConversations(req, res) {
  const { page = 1, limit = 20 } = req.query;
  const result = await listConversations(req.user.sub, Number(page), Number(limit));
  res.json(result);
}

export async function postMessage(req, res) {
  const { conversationId, text, files = [] } = sendMessageValidation.parse(req.body);
  const message = await sendMessage(conversationId, req.user.sub, text, files);
  try {
    const io = req.app.get('io');
    if (io) {
      const { default: Conversation } = await import('../models/Conversation.js');
      const conv = await Conversation.findById(conversationId).lean();
      const payload = {
        _id: message._id,
        text: message.text,
        senderId: message.senderId,
        conversationId: message.conversationId,
        createdAt: message.createdAt,
        files: message.files || [],
        type: message.type,
      };
      // Broadcast to room and participants
      io.to(`conversation_${conversationId}`).emit('new_message', { conversationId, message: payload });
      io.to(`conversation_${conversationId}`).emit('conversation_updated', { conversationId, lastMessage: payload, unreadCount: 1 });
      if (conv) {
        const buyerId = conv.buyerId?.toString?.();
        const sellerId = conv.sellerId?.toString?.();
        if (buyerId) io.to(`user_${buyerId}`).emit('conversation_updated', { conversationId, lastMessage: payload, unreadCount: 1 });
        if (sellerId) io.to(`user_${sellerId}`).emit('conversation_updated', { conversationId, lastMessage: payload, unreadCount: 1 });
        // Also emit new_message to personal rooms as a fallback
        if (buyerId) io.to(`user_${buyerId}`).emit('new_message', { conversationId, message: payload });
        if (sellerId) io.to(`user_${sellerId}`).emit('new_message', { conversationId, message: payload });
      }
    }
  } catch {}
  res.status(201).json(message);
}

export async function getMessages(req, res) {
  const { conversationId, page = 1, limit = 50 } = listMessagesValidation.parse({ ...req.query, conversationId: req.params.conversationId });
  const result = await listMessages(conversationId, Number(page), Number(limit));
  res.json(result);
}

export async function postMessageWithFiles(req, res) {
  try {
    const { conversationId, text = '' } = req.body;
    
    // Validate required fields
    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }
    
    if (!req.user || !req.user.sub) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    
    // Process uploaded files - upload to Cloudinary
    let files = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map((file) => new Promise((resolve) => {
          const resource_type = file.mimetype.startsWith('video') ? 'video' : 'image';
          cloudinary.uploader.upload_stream({ 
            resource_type,
            folder: 'chat-files'
          }, (err, uploaded) => {
            if (err) {
              return resolve({ success: false, error: err.message });
            }
            resolve({ 
              success: true, 
              url: uploaded.secure_url, 
              name: file.originalname,
              type: file.mimetype
            });
          }).end(file.buffer);
        }));

        const results = await Promise.all(uploadPromises);
        const successes = results.filter(r => r.success);
        
        files = successes.map(result => ({
          url: result.url,
          name: result.name,
          type: result.type
        }));
      } catch (uploadError) {
        return res.status(500).json({ 
          error: 'Failed to upload files to cloud storage',
          details: uploadError.message 
        });
      }
    }
    
    // Validate that we have either text or files
    if (!text && files.length === 0) {
      return res.status(400).json({ error: 'Either text or files must be provided' });
    }
    
    // Validate conversation exists
    const { default: Conversation } = await import('../models/Conversation.js');
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check if user is part of this conversation
    const isParticipant = conversation.buyerId.toString() === req.user.sub || 
                          conversation.sellerId.toString() === req.user.sub;
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized for this conversation' });
    }
    
    const message = await sendMessage(conversationId, req.user.sub, text, files);
    
    try {
      const io = req.app.get('io');
      if (io) {
        const payload = {
          _id: message._id,
          text: message.text,
          senderId: message.senderId,
          conversationId: message.conversationId,
          createdAt: message.createdAt,
          files: message.files || [],
          type: message.type,
        };
        io.to(`conversation_${conversationId}`).emit('new_message', { conversationId, message: payload });
        io.to(`conversation_${conversationId}`).emit('conversation_updated', { conversationId, lastMessage: payload, unreadCount: 1 });
      }
    } catch (socketError) {
      console.error('Socket error:', socketError);
    }
    
    res.status(201).json({ message });
  } catch (error) {
    console.error('Error uploading chat files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
}

export async function markAsRead(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user.sub;
    
    await markConversationAsRead(conversationId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ error: 'Failed to mark conversation as read' });
  }
}


