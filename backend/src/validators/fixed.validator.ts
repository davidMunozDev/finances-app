import { z } from "zod";

const FixedItemSchema = z.object({
  category_id: z.number().int().positive(),
  name: z.string().min(2).max(255),
  amount: z.number().positive(),
});

export const CreateFixedBulkSchema = z.object({
  items: z.array(FixedItemSchema).min(1).max(100),
});

export type CreateFixedBulkBody = z.infer<typeof CreateFixedBulkSchema>;
