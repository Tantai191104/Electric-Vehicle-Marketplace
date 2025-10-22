import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email().refine((email) => {
    const atCount = (email.match(/@/g) || []).length;
    return atCount === 1;
  }, "Email chỉ được có 1 ký tự @"),
  password: z.string().min(6).max(72),
  phone: z.string().regex(/^[0-9]{10,11}$/),
  role: z.enum(["user", "admin"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
});
