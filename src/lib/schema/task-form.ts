import { z } from "zod";

export const TaskFormZ = z.object({
  title: z.string().nonempty("Title cannot be empty!"),
  description: z.string().optional().nullable(),
  autograde: z.boolean().default(true).optional(),
  max_attempts: z.coerce.number().int().min(1, "Max attempts must be at least 1!").nullish(),
  min_score_to_pass: z.coerce.number().int().min(0, "Min score to pass must be at least 0!").nullish(),
});
