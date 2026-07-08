import { z } from "zod"

export const createFindingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  poc: z.string().optional(),
  rewardAmount: z.string().optional(),
})

export type CreateFindingInput = z.infer<typeof createFindingSchema>
