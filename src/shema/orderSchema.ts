import z from "zod";

const phoneRegex = new RegExp(/^(\+62|62|0)8[1-9][0-9]{6,10}$/);
const item = z.object({
  productId: z.string(),
  price: z.number().positive().min(1),
  quantity: z.number().positive().min(1),
});

export const orderSchema = z.object({
  receiverName: z.string().trim(),
  phoneNumber: z.string().regex(phoneRegex, "phone number invalid"),
  address: z.string().trim(),
  province: z.string().trim(),
  city: z.string().trim(),
  postalCode: z.string().trim(),
  totalAmount: z.number().positive(),
  items: item.array().nonempty(),
});

export type orderSchema = z.infer<typeof orderSchema>;
