import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { ReconProcessor } from "./recon.processor"

@Injectable()
export class ReconScheduler {
  private readonly logger = new Logger(ReconScheduler.name)

  constructor(private readonly reconProcessor: ReconProcessor) {}

  /**
   * Run daily recon at 03:00 UTC.
   * Scans all active programs and imports new subdomains.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyRecon() {
    this.logger.log("Cron: daily recon triggered")
    try {
      const result = await this.reconProcessor.runDailyRecon()
      this.logger.log(`Cron: daily recon done — ${result.totalImported} new assets from ${result.programsScanned} programs`)
    } catch (err) {
      this.logger.error(`Cron: daily recon failed — ${err}`)
    }
  }
}
