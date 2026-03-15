import { z } from 'zod';


export const RegisterSchema = z.object({
  email: z
    .email({ message: "Invalid email address" })
    .max(100, "email must be at most 100 characters."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password must be at most 100 characters."),
  name: z
    .string()
    .min(3, "Name must be at least 3 characters.")
    .max(100, "Name must be at most 100 characters."),
}).strict();

export type RegisterSchema = z.infer<typeof RegisterSchema>;