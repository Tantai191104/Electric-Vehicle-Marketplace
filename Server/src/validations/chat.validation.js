import { z } from "zod";

export const startChatValidation = z.object({
  productId: z.string().min(1),
  sellerId: z.string().min(1)
});

export const sendMessageValidation = z.object({
  conversationId: z.string().min(1),
  text: z.string().max(4000).optional(),
  files: z.array(z.object({
    url: z.string(),
    name: z.string(),
    type: z.string()
  })).optional()
});

export const listMessagesValidation = z.object({
  conversationId: z.string().min(1),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});


