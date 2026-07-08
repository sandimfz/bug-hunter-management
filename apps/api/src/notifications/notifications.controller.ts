import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from "@nestjs/common"
import { eq, and } from "drizzle-orm"
import { DatabaseService } from "../database/database.service"
import { notificationSettings } from "../database/schema"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly db: DatabaseService) {}

  @Get("settings")
  async getSettings(@Request() req: { user: { id: number } }) {
    return this.db.db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, req.user.id))
  }

  @Post("settings")
  async addSetting(
    @Request() req: { user: { id: number } },
    @Body() body: { channel: string; webhookUrl?: string },
  ) {
    const [setting] = await this.db.db
      .insert(notificationSettings)
      .values({
        userId: req.user.id,
        channel: body.channel,
        webhookUrl: body.webhookUrl,
      })
      .returning()
    return setting
  }

  @Delete("settings/:id")
  async removeSetting(
    @Request() req: { user: { id: number } },
    @Param("id", ParseIntPipe) id: number,
  ) {
    const [deleted] = await this.db.db
      .delete(notificationSettings)
      .where(
        and(
          eq(notificationSettings.id, id),
          eq(notificationSettings.userId, req.user.id),
        ),
      )
      .returning()
    return deleted ?? { message: "Not found" }
  }
}
