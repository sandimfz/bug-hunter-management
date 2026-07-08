import { Injectable, Logger } from "@nestjs/common"
import { eq, sql } from "drizzle-orm"
import { AssetsService } from "../assets/assets.service"
import { DatabaseService } from "../database/database.service"
import { assetSnapshots, programs } from "../database/schema"

interface ChaosResponse {
  domain: string
  subdomains: string[]
}

@Injectable()
export class ReconService {
  private readonly logger = new Logger(ReconService.name)

  constructor(
    private readonly assetsService: AssetsService,
    private readonly db: DatabaseService,
  ) {}

  /**
   * Fetch subdomains from ProjectDiscovery Chaos API.
   * Requires CHAOS_API_KEY env var (get from https://cloud.projectdiscovery.io).
   * Falls back to crt.sh if no key is set.
   */
  async fetchSubdomains(domain: string): Promise<string[]> {
    const apiKey = process.env.CHAOS_API_KEY

    if (apiKey) {
      return this.fetchFromChaos(domain, apiKey)
    }

    return this.fetchFromCrtSh(domain)
  }

  private async fetchFromChaos(domain: string, apiKey: string): Promise<string[]> {
    this.logger.log(`Fetching subdomains from Chaos API for: ${domain}`)
    try {
      const res = await fetch(
        `https://dns.projectdiscovery.io/dns/${domain}/subdomains`,
        { headers: { Authorization: apiKey } },
      )
      if (!res.ok) {
        this.logger.warn(`Chaos API returned ${res.status}`)
        return []
      }
      const data = (await res.json()) as ChaosResponse
      return (data.subdomains ?? []).map((s) => `${s}.${domain}`)
    } catch (err) {
      this.logger.error(`Chaos API error: ${err}`)
      return []
    }
  }

  /**
   * Fallback: fetch subdomains from crt.sh (free, no API key needed)
   */
  private async fetchFromCrtSh(domain: string): Promise<string[]> {
    this.logger.log(`Fetching subdomains from crt.sh for: ${domain}`)
    try {
      const res = await fetch(
        `https://crt.sh/?q=%25.${domain}&output=json`,
        { signal: AbortSignal.timeout(15000) },
      )
      if (!res.ok) {
        this.logger.warn(`crt.sh returned ${res.status}`)
        return []
      }
      const data = (await res.json()) as Array<{ name_value: string }>
      const subdomains = new Set<string>()
      for (const entry of data) {
        for (const name of entry.name_value.split("\n")) {
          const clean = name.trim().toLowerCase()
          if (clean.endsWith(`.${domain}`) && !clean.includes("*")) {
            subdomains.add(clean)
          }
        }
      }
      return [...subdomains]
    } catch (err) {
      this.logger.error(`crt.sh error: ${err}`)
      return []
    }
  }

  /**
   * Import discovered assets into a program, skipping duplicates.
   * Saves a snapshot with the diff.
   */
  async importDiscoveredAssets(programId: number, subdomains: string[]) {
    const { data: existing } = await this.assetsService.findByProgram(programId, { offset: 0, limit: 10000 })
    const existingValues = new Set(existing.map((a) => a.value))
    const newSubdomains = subdomains.filter((s) => !existingValues.has(s))

    // Save snapshot diff
    await this.db.db.insert(assetSnapshots).values({
      programId,
      totalAssets: subdomains.length,
      newAssets: newSubdomains.length,
      removedAssets: 0,
      newValues: newSubdomains,
      removedValues: [],
    })

    if (newSubdomains.length === 0) return []
    const dtos = newSubdomains.map((value) => ({
      programId,
      type: "subdomain" as const,
      value,
      status: "unchecked" as const,
    }))
    return this.assetsService.bulkCreate(dtos)
  }

  /**
   * Get snapshot history for a program.
   */
  async getSnapshots(programId: number) {
    return this.db.db
      .select()
      .from(assetSnapshots)
      .where(eq(assetSnapshots.programId, programId))
      .orderBy(sql`scan_date DESC`)
      .limit(20)
  }

  async getSnapshotsByUuid(programUuid: string) {
    const [program] = await this.db.db
      .select({ id: programs.id })
      .from(programs)
      .where(eq(programs.uuid, programUuid))
    if (!program) return []
    return this.getSnapshots(program.id)
  }
}
