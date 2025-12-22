import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(2).max(255),
  icon: z.string().max(50).optional(),
});

export type CreateCategoryBody = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = z
  .object({
    name: z.string().min(2).max(255).optional(),
    icon: z.string().max(50).optional().nullable(),
  })
  .refine((data) => data.name !== undefined || data.icon !== undefined, {
    message: "Debes enviar al menos name o icon",
  });

export type UpdateCategoryBody = z.infer<typeof UpdateCategorySchema>;
