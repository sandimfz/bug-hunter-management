import { Controller, Get, UseGuards, Request } from "@nestjs/common"
import { DatabaseService } from "../database/database.service"
import { programs, assets, findings, workspaces } from "../database/schema"
import { eq, sql } from "drizzle-orm"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("stats")
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly db: DatabaseService) {}

  @Get("dashboard")
  async getDashboardStats(@Request() req: { user: { id: number } }) {
    const userId = req.user.id

    const [programCount] = await this.db.db
      .select({ count: sql<number>`count(*)::int` })
      .from(programs)
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))

    const [activeProgramCount] = await this.db.db
      .select({ count: sql<number>`count(*)::int` })
      .from(programs)
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(sql`${workspaces.ownerId} = ${userId} AND ${programs.status} = 'active'`)

    const [assetCount] = await this.db.db
      .select({ count: sql<number>`count(*)::int` })
      .from(assets)
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))

    const [findingCount] = await this.db.db
      .select({ count: sql<number>`count(*)::int` })
      .from(findings)
      .innerJoin(assets, eq(findings.assetId, assets.id))
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))

    const [criticalCount] = await this.db.db
      .select({ count: sql<number>`count(*)::int` })
      .from(findings)
      .innerJoin(assets, eq(findings.assetId, assets.id))
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(sql`${workspaces.ownerId} = ${userId} AND ${findings.severity} = 'critical'`)

    const [totalBounty] = await this.db.db
      .select({ sum: sql<number>`coalesce(sum(${findings.rewardAmount}), 0)::int` })
      .from(findings)
      .innerJoin(assets, eq(findings.assetId, assets.id))
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))

    const [paidCount] = await this.db.db
      .select({ count: sql<number>`count(*)::int` })
      .from(findings)
      .innerJoin(assets, eq(findings.assetId, assets.id))
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(sql`${workspaces.ownerId} = ${userId} AND ${findings.status} = 'paid'`)

    return {
      programs: programCount.count,
      activePrograms: activeProgramCount.count,
      assets: assetCount.count,
      findings: findingCount.count,
      criticalFindings: criticalCount.count,
      totalBounty: totalBounty.sum,
      paidFindings: paidCount.count,
    }
  }

  @Get("bounty")
  async getBountyStats(@Request() req: { user: { id: number } }) {
    const userId = req.user.id

    const [totalEarned] = await this.db.db
      .select({ sum: sql<number>`coalesce(sum(${findings.rewardAmount}), 0)::int` })
      .from(findings)
      .innerJoin(assets, eq(findings.assetId, assets.id))
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(sql`${workspaces.ownerId} = ${userId} AND ${findings.status} = 'paid'`)

    const [pendingAmount] = await this.db.db
      .select({ sum: sql<number>`coalesce(sum(${findings.rewardAmount}), 0)::int` })
      .from(findings)
      .innerJoin(assets, eq(findings.assetId, assets.id))
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(sql`${workspaces.ownerId} = ${userId} AND ${findings.status} IN ('submitted', 'triaged', 'accepted')`)

    const [paidThisMonth] = await this.db.db
      .select({ sum: sql<number>`coalesce(sum(${findings.rewardAmount}), 0)::int` })
      .from(findings)
      .innerJoin(assets, eq(findings.assetId, assets.id))
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(sql`${workspaces.ownerId} = ${userId} AND ${findings.status} = 'paid' AND date_trunc('month', ${findings.updatedAt}) = date_trunc('month', now())`)

    const recentPaid = await this.db.db
      .select({
        id: findings.id,
        title: findings.title,
        severity: findings.severity,
        rewardAmount: findings.rewardAmount,
        updatedAt: findings.updatedAt,
      })
      .from(findings)
      .innerJoin(assets, eq(findings.assetId, assets.id))
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(sql`${workspaces.ownerId} = ${userId} AND ${findings.status} = 'paid'`)
      .orderBy(sql`${findings.updatedAt} DESC`)
      .limit(10)

    return {
      totalEarned: totalEarned.sum,
      pendingAmount: pendingAmount.sum,
      paidThisMonth: paidThisMonth.sum,
      recentPaid,
    }
  }

  @Get("analytics")
  async getAnalytics(@Request() req: { user: { id: number } }) {
    const userId = req.user.id

    const severityCounts = await this.db.db
      .select({ severity: findings.severity, count: sql<number>`count(*)::int` })
      .from(findings)
      .innerJoin(assets, eq(findings.assetId, assets.id))
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))
      .groupBy(findings.severity)

    const statusCounts = await this.db.db
      .select({ status: findings.status, count: sql<number>`count(*)::int` })
      .from(findings)
      .innerJoin(assets, eq(findings.assetId, assets.id))
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))
      .groupBy(findings.status)

    const assetTypeCounts = await this.db.db
      .select({ type: assets.type, count: sql<number>`count(*)::int` })
      .from(assets)
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))
      .groupBy(assets.type)

    const bountyByMonth = await this.db.db.execute(sql`
      SELECT
        to_char(date_trunc('month', f.updated_at), 'YYYY-MM') AS month,
        coalesce(sum(f.reward_amount), 0)::int AS total
      FROM findings f
      INNER JOIN assets a ON f.asset_id = a.id
      INNER JOIN programs p ON a.program_id = p.id
      INNER JOIN workspaces w ON p.workspace_id = w.id
      WHERE w.owner_id = ${userId}
        AND f.status = 'paid'
        AND f.updated_at > now() - interval '6 months'
      GROUP BY date_trunc('month', f.updated_at)
      ORDER BY month
    `)

    const assetsByMonth = await this.db.db.execute(sql`
      SELECT
        to_char(date_trunc('month', a.created_at), 'YYYY-MM') AS month,
        count(*)::int AS total
      FROM assets a
      INNER JOIN programs p ON a.program_id = p.id
      INNER JOIN workspaces w ON p.workspace_id = w.id
      WHERE w.owner_id = ${userId}
        AND a.created_at > now() - interval '6 months'
      GROUP BY date_trunc('month', a.created_at)
      ORDER BY month
    `)

    return {
      severityCounts: Object.fromEntries(severityCounts.map(r => [r.severity, r.count])),
      statusCounts: Object.fromEntries(statusCounts.map(r => [r.status, r.count])),
      assetTypeCounts: Object.fromEntries(assetTypeCounts.map(r => [r.type, r.count])),
      bountyByMonth,
      assetsByMonth,
    }
  }
}
