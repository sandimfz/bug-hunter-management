import { Controller, Get, Param, ParseIntPipe, Res, UseGuards, Request } from "@nestjs/common"
import { eq, sql } from "drizzle-orm"
import type { Response } from "express"
import { DatabaseService } from "../database/database.service"
import { programs, assets, findings, workspaces } from "../database/schema"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("reports")
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly db: DatabaseService) {}

  @Get("program/:programUuid/markdown")
  async generateProgramReport(
    @Request() req: { user: { id: number } },
    @Param("programUuid") programUuid: string,
    @Res() res: Response,
  ) {
    const userId = req.user.id

    const [program] = await this.db.db
      .select()
      .from(programs)
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(sql`${programs.uuid} = ${programUuid} AND ${workspaces.ownerId} = ${userId}`)
    if (!program) {
      return res.status(404).json({ message: "Program not found" })
    }

    const programAssets = await this.db.db
      .select()
      .from(assets)
      .where(eq(assets.programId, program.programs.id))

    const assetIds = programAssets.map((a) => a.id)
    let programFindings: Array<{
      id: number
      assetId: number
      title: string
      severity: string
      status: string
      poc: string | null
      rewardAmount: number | null
      createdAt: Date
    }> = []

    if (assetIds.length > 0) {
      programFindings = await this.db.db
        .select()
        .from(findings)
        .where(sql`${findings.assetId} IN (${sql.join(assetIds.map(id => sql`${id}`), sql`, `)})`)
    }

    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    programFindings.sort(
      (a, b) =>
        (severityOrder[a.severity as keyof typeof severityOrder] ?? 5) -
        (severityOrder[b.severity as keyof typeof severityOrder] ?? 5),
    )

    const totalReward = programFindings.reduce((s, f) => s + (f.rewardAmount ?? 0), 0)
    const severityCounts = programFindings.reduce(
      (acc, f) => {
        acc[f.severity] = (acc[f.severity] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    let md = `# Bug Report: ${program.programs.name}\n\n`
    md += `**Platform:** ${program.programs.platform}\n`
    md += `**Status:** ${program.programs.status}\n`
    md += `**Generated:** ${new Date().toISOString().split("T")[0]}\n\n`

    md += `## Summary\n\n`
    md += `| Metric | Value |\n|---|---|\n`
    md += `| Total Assets | ${programAssets.length} |\n`
    md += `| Total Findings | ${programFindings.length} |\n`
    md += `| Total Reward | $${totalReward} |\n`
    for (const [sev, count] of Object.entries(severityCounts)) {
      md += `| ${sev.charAt(0).toUpperCase() + sev.slice(1)} | ${count} |\n`
    }
    md += `\n`

    if (program.programs.scopeNotes) {
      md += `## Scope\n\n${program.programs.scopeNotes}\n\n`
    }

    if (programFindings.length > 0) {
      md += `## Findings\n\n`
      for (const f of programFindings) {
        const asset = programAssets.find((a) => a.id === f.assetId)
        md += `### ${f.title}\n\n`
        md += `- **Severity:** ${f.severity}\n`
        md += `- **Status:** ${f.status}\n`
        md += `- **Target:** ${asset?.value ?? "N/A"}\n`
        if (f.rewardAmount) {
          md += `- **Reward:** $${f.rewardAmount}\n`
        }
        if (f.poc) {
          md += `\n**Proof of Concept:**\n\n\`\`\`\n${f.poc}\n\`\`\`\n`
        }
        md += `\n---\n\n`
      }
    }

    if (programAssets.length > 0) {
      md += `## Assets\n\n`
      md += `| Value | Type | Status |\n|---|---|---|\n`
      for (const a of programAssets) {
        md += `| ${a.value} | ${a.type} | ${a.status} |\n`
      }
    }

    res.setHeader("Content-Type", "text/markdown; charset=utf-8")
    res.setHeader("Content-Disposition", `attachment; filename="${program.programs.name.replace(/[^a-zA-Z0-9]/g, "_")}_report.md"`)
    return res.send(md)
  }

  @Get("all/markdown")
  async generateAllReport(
    @Request() req: { user: { id: number } },
    @Res() res: Response,
  ) {
    const userId = req.user.id

    const allFindings = await this.db.db
      .select({
        id: findings.id,
        title: findings.title,
        severity: findings.severity,
        status: findings.status,
        rewardAmount: findings.rewardAmount,
        assetId: findings.assetId,
        createdAt: findings.createdAt,
      })
      .from(findings)
      .innerJoin(assets, eq(findings.assetId, assets.id))
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))
      .orderBy(sql`${findings.createdAt} DESC`)

    const allPrograms = await this.db.db
      .select()
      .from(programs)
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))

    const allAssets = await this.db.db
      .select()
      .from(assets)
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))

    const totalReward = allFindings.reduce((s, f) => s + (f.rewardAmount ?? 0), 0)
    const severityCounts = allFindings.reduce(
      (acc, f) => {
        acc[f.severity] = (acc[f.severity] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    let md = `# Bug Hunter — Full Report\n\n`
    md += `**Generated:** ${new Date().toISOString().split("T")[0]}\n\n`
    md += `## Summary\n\n`
    md += `| Metric | Value |\n|---|---|\n`
    md += `| Programs | ${allPrograms.length} |\n`
    md += `| Assets | ${allAssets.length} |\n`
    md += `| Findings | ${allFindings.length} |\n`
    md += `| Total Bounty | $${totalReward} |\n`
    for (const [sev, count] of Object.entries(severityCounts)) {
      md += `| ${sev.charAt(0).toUpperCase() + sev.slice(1)} | ${count} |\n`
    }

    if (allFindings.length > 0) {
      md += `\n## All Findings\n\n`
      md += `| Title | Severity | Status | Reward |\n|---|---|---|---|\n`
      for (const f of allFindings) {
        md += `| ${f.title} | ${f.severity} | ${f.status} | $${f.rewardAmount ?? 0} |\n`
      }
    }

    res.setHeader("Content-Type", "text/markdown; charset=utf-8")
    res.setHeader("Content-Disposition", `attachment; filename="bughunter_report.md"`)
    return res.send(md)
  }
}
