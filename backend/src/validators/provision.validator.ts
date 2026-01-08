import { z } from "zod";

const ProvisionItemSchema = z.object({
  category_id: z.number().int().positive(),
  name: z.string().min(2).max(255),
  amount: z.number().positive(),
});

export const CreateProvisionBulkSchema = z.object({
  items: z.array(ProvisionItemSchema).min(1).max(100),
});

export type CreateProvisionBulkBody = z.infer<typeof CreateProvisionBulkSchema>;
