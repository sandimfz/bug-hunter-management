import { z } from "zod"

export const createAssetSchema = z.object({
  value: z.string().min(1, "Value is required"),
  type: z.enum(["domain", "subdomain", "endpoint", "api", "ip"]),
  notes: z.string().optional(),
})

export type CreateAssetInput = z.infer<typeof createAssetSchema>
