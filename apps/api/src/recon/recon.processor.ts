import { Injectable, Logger } from "@nestjs/common"
import { eq } from "drizzle-orm"
import { ReconService } from "./recon.service"
import { NotificationsService } from "../notifications/notifications.service"
import { DatabaseService } from "../database/database.service"
import { programs, workspaces } from "../database/schema"

@Injectable()
export class ReconProcessor {
  private readonly logger = new Logger(ReconProcessor.name)

  constructor(
    private readonly reconService: ReconService,
    private readonly notificationsService: NotificationsService,
    private readonly db: DatabaseService,
  ) {}

  /**
   * Process a recon job for a given domain and program.
   * Sends notification if new assets are found.
   */
  async processReconJob(programId: number, domain: string) {
    this.logger.log(`Starting recon job for ${domain} (program #${programId})`)

    const subdomains = await this.reconService.fetchSubdomains(domain)

    if (subdomains.length === 0) {
      this.logger.warn(`No subdomains found for ${domain}`)
      return { imported: 0, total: 0 }
    }

    const result = await this.reconService.importDiscoveredAssets(
      programId,
      subdomains,
    )

    this.logger.log(`Imported ${result.length} new assets for ${domain}`)

    // Notify if new assets found
    if (result.length > 0) {
      const [program] = await this.db.db
        .select()
        .from(programs)
        .where(eq(programs.id, programId))
      if (program) {
        const [workspace] = await this.db.db
          .select()
          .from(workspaces)
          .where(eq(workspaces.id, program.workspaceId))
        if (workspace) {
          await this.notificationsService.notifyNewAssets(
            workspace.ownerId,
            result.length,
            program.name,
          )
        }
      }
    }

    return { imported: result.length, total: subdomains.length }
  }

  /**
   * Scheduled daily recon — scans all active programs.
   * Runs at 03:00 UTC every day.
   */
  async runDailyRecon() {
    this.logger.log("Starting daily scheduled recon...")

    const activePrograms = await this.db.db
      .select()
      .from(programs)
      .where(eq(programs.status, "active"))

    let totalImported = 0
    for (const program of activePrograms) {
      if (!program.scopeNotes) continue
      // Extract domains from scope notes (simple: split by newline, look for domain patterns)
      const domains = this.extractDomains(program.scopeNotes)
      for (const domain of domains) {
        try {
          const result = await this.processReconJob(program.id, domain)
          totalImported += result.imported
        } catch (err) {
          this.logger.error(`Recon failed for ${domain}: ${err}`)
        }
      }
    }

    this.logger.log(`Daily recon complete: ${totalImported} new assets across ${activePrograms.length} programs`)
    return { programsScanned: activePrograms.length, totalImported }
  }

  private extractDomains(text: string): string[] {
    const domainRegex = /(?:^|\s)([a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,})(?:\s|$)/gm
    const domains = new Set<string>()
    let match
    while ((match = domainRegex.exec(text)) !== null) {
      const d = match[1].toLowerCase()
      if (!d.includes("*") && !d.startsWith(".")) {
        domains.add(d)
      }
    }
    return [...domains]
  }
}
