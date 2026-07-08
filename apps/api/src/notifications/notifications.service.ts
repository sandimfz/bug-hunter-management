import { Injectable, Logger } from "@nestjs/common"
import { eq } from "drizzle-orm"
import * as nodemailer from "nodemailer"
import { DatabaseService } from "../database/database.service"
import { notificationSettings } from "../database/schema"

export interface NotificationPayload {
  type: "new_asset" | "finding_created" | "finding_paid"
  title: string
  message: string
  data?: Record<string, unknown>
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private transporter: nodemailer.Transporter | null = null

  constructor(private readonly db: DatabaseService) {
    // Initialize SMTP transporter if configured
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      })
      this.logger.log("SMTP email transport configured")
    }
  }

  /**
   * Send notification via all enabled channels for a user.
   */
  async send(userId: number, payload: NotificationPayload) {
    this.logger.log(`Notification [user=${userId}]: ${payload.title} — ${payload.message}`)

    const channels = await this.db.db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId))

    const results: Array<{ channel: string; success: boolean }> = []
    for (const ch of channels) {
      if (ch.enabled) continue
      if ((ch.channel === "slack" || ch.channel === "discord") && ch.webhookUrl) {
        const ok = await this.sendWebhook(ch.webhookUrl, ch.channel, payload)
        results.push({ channel: ch.channel, success: ok })
      } else if (ch.channel === "email" && ch.webhookUrl) {
        // webhookUrl stores email address for email channel
        const ok = await this.sendEmail(ch.webhookUrl, payload)
        results.push({ channel: "email", success: ok })
      }
    }

    return { sent: results.length > 0, results, payload }
  }

  private async sendEmail(to: string, payload: NotificationPayload): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn("SMTP not configured — skipping email notification")
      return false
    }
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM ?? "BugHunter <noreply@bughunter.local>",
        to,
        subject: `[BugHunter] ${payload.title}`,
        html: `
          <div style="font-family: monospace; background: #09090b; color: #f4f4f5; padding: 24px;">
            <h2 style="color: #34d399; margin-bottom 16px;">🐛 ${payload.title}</h2>
            <p style="color: #a1a1aa;">${payload.message}</p>
            <hr style="border-color: #27272a; margin: 16px 0;" />
            <p style="color: #71717a; font-size: 12px;">BugHunter Notification</p>
          </div>
        `,
      })
      return true
    } catch (err) {
      this.logger.error(`Email send failed: ${err}`)
      return false
    }
  }

  private async sendWebhook(url: string, channel: string, payload: NotificationPayload): Promise<boolean> {
    try {
      let body: Record<string, unknown>
      if (channel === "slack") {
        body = {
          text: `*${payload.title}*\n${payload.message}`,
          blocks: [
            {
              type: "section",
              text: { type: "mrkdwn", text: `*${payload.title}*\n${payload.message}` },
            },
          ],
        }
      } else {
        body = {
          content: `**${payload.title}**\n${payload.message}`,
          embeds: [
            {
              title: payload.title,
              description: payload.message,
              color: payload.type === "new_asset" ? 3447003 : 15158332,
            },
          ],
        }
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      })
      return res.ok
    } catch (err) {
      this.logger.error(`Webhook send failed: ${err}`)
      return false
    }
  }

  async notifyNewAssets(userId: number, count: number, programName: string) {
    return this.send(userId, {
      type: "new_asset",
      title: "New Assets Discovered",
      message: `${count} new subdomain(s) found in program "${programName}"`,
    })
  }

  async notifyNewFinding(userId: number, title: string, severity: string) {
    return this.send(userId, {
      type: "finding_created",
      title: "New Finding Recorded",
      message: `${severity}: ${title}`,
    })
  }
}

