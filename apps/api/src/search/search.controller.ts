import { Controller, Get, Query, UseGuards, Request } from "@nestjs/common"
import { eq, sql } from "drizzle-orm"
import { DatabaseService } from "../database/database.service"
import { programs, assets, findings, workspaces } from "../database/schema"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("search")
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async search(
    @Request() req: { user: { id: number } },
    @Query("q") query: string,
  ) {
    if (!query || query.trim().length < 2) {
      return { programs: [], assets: [], findings: [] }
    }

    const userId = req.user.id
    const pattern = `%${query.trim().toLowerCase()}%`

    const matchedPrograms = await this.db.db
      .select({ id: programs.id, uuid: programs.uuid, name: programs.name, platform: programs.platform })
      .from(programs)
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(sql`${workspaces.ownerId} = ${userId} AND lower(${programs.name}) LIKE ${pattern}`)
      .limit(5)

    const matchedAssets = await this.db.db
      .select({ id: assets.id, uuid: assets.uuid, programId: assets.programId, programUuid: programs.uuid, value: assets.value, type: assets.type })
      .from(assets)
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(sql`${workspaces.ownerId} = ${userId} AND lower(${assets.value}) LIKE ${pattern}`)
      .limit(5)

    const matchedFindings = await this.db.db
      .select({ id: findings.id, uuid: findings.uuid, assetId: findings.assetId, title: findings.title, severity: findings.severity })
      .from(findings)
      .innerJoin(assets, eq(findings.assetId, assets.id))
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(sql`${workspaces.ownerId} = ${userId} AND lower(${findings.title}) LIKE ${pattern}`)
      .limit(5)

    return {
      programs: matchedPrograms,
      assets: matchedAssets,
      findings: matchedFindings,
    }
  }
}
