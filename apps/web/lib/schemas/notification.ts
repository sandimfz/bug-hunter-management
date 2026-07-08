import { z } from "zod"

export const addNotificationSchema = z.object({
  channel: z.enum(["discord", "slack", "email"]),
  webhookUrl: z.string().min(1, "URL is required"),
})

export type AddNotificationInput = z.infer<typeof addNotificationSchema>
