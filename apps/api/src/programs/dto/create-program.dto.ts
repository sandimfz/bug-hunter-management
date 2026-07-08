import { z } from "zod"

export const createProgramSchema = z.object({
  workspaceUuid: z.string().uuid("Invalid workspace UUID"),
  name: z.string().min(1, "Name is required").max(200),
  platform: z.enum(["hackerone", "bugcrowd", "private", "other"]),
  status: z.enum(["active", "paused", "completed"]).default("active"),
  scopeNotes: z.string().optional(),
})

export type CreateProgramDto = z.infer<typeof createProgramSchema>
