import { startConversation, listConversations, sendMessage, listMessages, markConversationAsRead } from "../services/chatService.js";
import { startChatValidation, sendMessageValidation, listMessagesValidation } from "../validations/chat.validation.js";

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
    const files = req.files ? req.files.map(file => ({
      url: `/uploads/chat/${file.filename}`,
      name: file.originalname,
      type: file.mimetype
    })) : [];
    
    const message = await sendMessage(conversationId, req.user.sub, text, files);
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


