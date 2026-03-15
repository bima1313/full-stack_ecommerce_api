import { z } from "zod";

export const productSchema = z
  .object({
    name: z
      .string({ message: "Input the name" })
      .trim()
      .min(4, "Name must be at least 4 characters")
      .max(100, "Name must be at most 100 characters."),
    price: z.coerce
      .number()
      .positive()
      .min(1000, "Minimun price is 1.000 Rupiah")
      .max(50000000, "Maxsimum price is 50.000.000 Rupiah"),
    description: z
      .string()
      .min(4, "Name must be at least 4 characters")
      .max(100, "Name must be at most 100 characters.")
      .optional(),
    stock: z.coerce.number().int().min(1, "Stock must be at least 1 item"),
    category: z
      .string()
      .trim()
      .min(3, "Category name must be at least 3 characters")
      .max(100, "Name must be at most 100 characters."),
  })
  .strict();

export type productSchema = z.infer<typeof productSchema>;

export const patchProductSchema = productSchema.partial();
export type patchProductSchema = z.infer<typeof patchProductSchema>;
