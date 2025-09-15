import { z } from "zod";

export const startChatValidation = z.object({
  productId: z.string().min(1),
  sellerId: z.string().min(1)
});

export const sendMessageValidation = z.object({
  conversationId: z.string().min(1),
  text: z.string().min(1).max(4000)
});

export const listMessagesValidation = z.object({
  conversationId: z.string().min(1),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});


