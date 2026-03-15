import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .email({ message: "Invalid email address" })
    .max(100, "email must be at most 100 characters."),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password must be at most 100 characters."),
}).strict();

export type LoginSchema = z.infer<typeof LoginSchema>;