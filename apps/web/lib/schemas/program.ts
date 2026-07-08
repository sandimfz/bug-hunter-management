import { z } from "zod"

export const createProgramSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  platform: z.enum(["hackerone", "bugcrowd", "private", "other"]),
  scopeNotes: z.string().optional(),
})

export type CreateProgramInput = z.infer<typeof createProgramSchema>
