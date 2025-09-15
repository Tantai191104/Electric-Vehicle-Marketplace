import { startConversation, listConversations, sendMessage, listMessages } from "../services/chatService.js";
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
  const { conversationId, text } = sendMessageValidation.parse(req.body);
  const message = await sendMessage(conversationId, req.user.sub, text);
  res.status(201).json(message);
}

export async function getMessages(req, res) {
  const { conversationId, page = 1, limit = 50 } = listMessagesValidation.parse({ ...req.query, conversationId: req.params.conversationId });
  const result = await listMessages(conversationId, Number(page), Number(limit));
  res.json(result);
}


