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
    console.log('=== POST MESSAGE WITH FILES DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('User:', req.user);
    
    const { conversationId, text = '' } = req.body;
    
    // Validate required fields
    if (!conversationId) {
      console.log('ERROR: conversationId is missing');
      return res.status(400).json({ error: 'conversationId is required' });
    }
    
    if (!req.user || !req.user.sub) {
      console.log('ERROR: User authentication missing');
      return res.status(401).json({ error: 'User authentication required' });
    }
    
    // Process uploaded files - upload to Cloudinary
    let files = [];
    if (req.files && req.files.length > 0) {
      console.log('Uploading files to Cloudinary...');
      console.log('Files to upload:', req.files.map(f => ({ name: f.originalname, size: f.size, mimetype: f.mimetype })));
      
      try {
        const uploadPromises = req.files.map((file) => new Promise((resolve) => {
          console.log(`Uploading file: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`);
          const resource_type = file.mimetype.startsWith('video') ? 'video' : 'image';
          cloudinary.uploader.upload_stream({ 
            resource_type,
            folder: 'chat-files' // Organize chat files in a separate folder
          }, (err, uploaded) => {
            if (err) {
              console.error('Cloudinary upload error for file:', file.originalname, err);
              return resolve({ success: false, error: err.message });
            }
            console.log('Successfully uploaded to Cloudinary:', uploaded.secure_url);
            resolve({ 
              success: true, 
              url: uploaded.secure_url, 
              name: file.originalname,
              type: file.mimetype,
              resource_type 
            });
          }).end(file.buffer);
        }));

        const results = await Promise.all(uploadPromises);
        console.log('Upload results:', results);
        
        const successes = results.filter(r => r.success);
        const failures = results.filter(r => !r.success);
        
        if (failures.length > 0) {
          console.error('Some files failed to upload:', failures);
        }
        
        files = successes.map(result => ({
          url: result.url,
          name: result.name,
          type: result.type
        }));
        console.log('Successfully uploaded files:', files);
      } catch (uploadError) {
        console.error('Error during Cloudinary upload process:', uploadError);
        return res.status(500).json({ 
          error: 'Failed to upload files to cloud storage',
          details: uploadError.message 
        });
      }
    }
    
    // Validate that we have either text or files
    if (!text && files.length === 0) {
      console.log('ERROR: No content provided (text or files required)');
      return res.status(400).json({ error: 'Either text or files must be provided' });
    }
    
    // Validate conversation exists
    const { default: Conversation } = await import('../models/Conversation.js');
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log('ERROR: Conversation not found');
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check if user is part of this conversation
    const isParticipant = conversation.buyerId.toString() === req.user.sub || 
                          conversation.sellerId.toString() === req.user.sub;
    if (!isParticipant) {
      console.log('ERROR: User not authorized for this conversation');
      return res.status(403).json({ error: 'Not authorized for this conversation' });
    }
    
    console.log('Creating message with:', { conversationId, text, files });
    let message;
    try {
      message = await sendMessage(conversationId, req.user.sub, text, files);
      console.log('Message created:', message);
    } catch (messageError) {
      console.error('Error creating message:', messageError);
      return res.status(500).json({ 
        error: 'Failed to create message',
        details: messageError.message 
      });
    }
    
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
    
    console.log('=== SUCCESS: Message sent ===');
    res.status(201).json({ message });
  } catch (error) {
    console.error('=== ERROR: Failed to upload files ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
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


