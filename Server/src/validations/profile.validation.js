import { z } from "zod";

export const updateProfileValidation = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z.string().regex(/^[0-9]{10,11}$/).optional(),
  avatar: z.string().url().optional(),
  
  profile: z.object({
    fullName: z.string().min(2).max(100).optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    
    address: z.object({
      street: z.string().max(200).optional(),
      city: z.string().max(50).optional(),
      province: z.string().max(50).optional(),
      zipCode: z.string().max(10).optional(),
      country: z.string().max(50).optional()
    }).optional(),
    
    identityCard: z.string().regex(/^[0-9]{9,12}$/).optional(),
    
    bankAccount: z.object({
      bankName: z.string().max(100).optional(),
      accountNumber: z.string().max(20).optional(),
      accountHolder: z.string().max(100).optional()
    }).optional()
  }).optional()
});

export const updatePreferencesValidation = z.object({
  notifications: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    push: z.boolean().optional()
  }).optional(),
  
  language: z.enum(['vi', 'en']).optional(),
  currency: z.enum(['VND', 'USD']).optional()
});

export const addToWishlistValidation = z.object({
  productId: z.string().min(1),
  notes: z.string().max(500).optional()
});

export const updateOrderStatusValidation = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded']),
  notes: z.string().max(1000).optional()
});

export const uploadAvatarValidation = z.object({
  avatarUrl: z.string().url()
});

export const getWalletTransactionsValidation = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

export const getWishlistValidation = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

export const getOrdersValidation = z.object({
  type: z.enum(['all', 'buyer', 'seller']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});
