import { Injectable, NotFoundException } from "@nestjs/common"
import { eq, sql } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import { DatabaseService } from "../database/database.service"
import { findings, assets, programs, workspaces } from "../database/schema"
import { CreateFindingDto } from "./dto/create-finding.dto"
import { UpdateFindingDto } from "./dto/update-finding.dto"

interface PaginationOpts {
  offset: number
  limit: number
}

@Injectable()
export class FindingsService {
  constructor(private readonly db: DatabaseService) {}

  async findByUser(userId: number, opts: PaginationOpts = { offset: 0, limit: 50 }) {
    const [countResult] = await this.db.db
      .select({ count: sql<number>`count(*)::int` })
      .from(findings)
      .innerJoin(assets, eq(findings.assetId, assets.id))
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))
    const data = await this.db.db
      .select({
        id: findings.id,
        uuid: findings.uuid,
        assetId: findings.assetId,
        title: findings.title,
        severity: findings.severity,
        status: findings.status,
        poc: findings.poc,
        rewardAmount: findings.rewardAmount,
        createdAt: findings.createdAt,
        updatedAt: findings.updatedAt,
      })
      .from(findings)
      .innerJoin(assets, eq(findings.assetId, assets.id))
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))
      .limit(opts.limit)
      .offset(opts.offset)
      .orderBy(sql`findings.created_at DESC`)
    return { data, total: countResult.count }
  }

  async findOne(uuid: string) {
    const [finding] = await this.db.db
      .select()
      .from(findings)
      .where(eq(findings.uuid, uuid))
    if (!finding) throw new NotFoundException(`Finding ${uuid} not found`)
    return finding
  }

  async findByAsset(assetId: number, opts: PaginationOpts = { offset: 0, limit: 50 }) {
    const [countResult] = await this.db.db
      .select({ count: sql<number>`count(*)::int` })
      .from(findings)
      .where(eq(findings.assetId, assetId))
    const data = await this.db.db
      .select()
      .from(findings)
      .where(eq(findings.assetId, assetId))
      .limit(opts.limit)
      .offset(opts.offset)
      .orderBy(sql`created_at DESC`)
    return { data, total: countResult.count }
  }

  async findByAssetUuid(assetUuid: string, opts: PaginationOpts = { offset: 0, limit: 50 }) {
    const [asset] = await this.db.db
      .select({ id: assets.id })
      .from(assets)
      .where(eq(assets.uuid, assetUuid))
    if (!asset) return { data: [], total: 0 }
    return this.findByAsset(asset.id, opts)
  }

  async create(dto: CreateFindingDto) {
    let assetId = dto.assetId
    if (!assetId && dto.assetUuid) {
      const [asset] = await this.db.db
        .select({ id: assets.id })
        .from(assets)
        .where(eq(assets.uuid, dto.assetUuid))
      if (!asset) throw new NotFoundException(`Asset ${dto.assetUuid} not found`)
      assetId = asset.id
    }
    if (!assetId) throw new NotFoundException("assetId or assetUuid required")
    const { assetUuid: _, ...rest } = dto
    const [finding] = await this.db.db
      .insert(findings)
      .values({ ...rest, assetId, uuid: uuidv4() })
      .returning()
    return finding
  }

  async update(uuid: string, dto: UpdateFindingDto) {
    const [finding] = await this.db.db
      .update(findings)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(findings.uuid, uuid))
      .returning()
    if (!finding) throw new NotFoundException(`Finding ${uuid} not found`)
    return finding
  }

  async remove(uuid: string) {
    const [finding] = await this.db.db
      .delete(findings)
      .where(eq(findings.uuid, uuid))
      .returning()
    if (!finding) throw new NotFoundException(`Finding ${uuid} not found`)
    return finding
  }
}
