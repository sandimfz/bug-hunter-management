import { Injectable, NotFoundException } from "@nestjs/common"
import { eq, sql } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import { DatabaseService } from "../database/database.service"
import { assets, programs, workspaces } from "../database/schema"
import { CreateAssetDto } from "./dto/create-asset.dto"
import { UpdateAssetDto } from "./dto/update-asset.dto"

interface PaginationOpts {
  offset: number
  limit: number
}

@Injectable()
export class AssetsService {
  constructor(private readonly db: DatabaseService) {}

  async findByUser(userId: number, opts: PaginationOpts = { offset: 0, limit: 50 }) {
    const [countResult] = await this.db.db
      .select({ count: sql<number>`count(*)::int` })
      .from(assets)
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))
    const data = await this.db.db
      .select({
        id: assets.id,
        uuid: assets.uuid,
        programId: assets.programId,
        type: assets.type,
        value: assets.value,
        status: assets.status,
        tags: assets.tags,
        notes: assets.notes,
        method: assets.method,
        requestHeaders: assets.requestHeaders,
        requestBody: assets.requestBody,
        responseStatus: assets.responseStatus,
        responseHeaders: assets.responseHeaders,
        responseBody: assets.responseBody,
        contentType: assets.contentType,
        firstSeenAt: assets.firstSeenAt,
        lastSeenAt: assets.lastSeenAt,
        createdAt: assets.createdAt,
        updatedAt: assets.updatedAt,
      })
      .from(assets)
      .innerJoin(programs, eq(assets.programId, programs.id))
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))
      .limit(opts.limit)
      .offset(opts.offset)
      .orderBy(sql`assets.created_at DESC`)
    return { data, total: countResult.count }
  }

  async findOne(uuid: string) {
    const [asset] = await this.db.db
      .select()
      .from(assets)
      .where(eq(assets.uuid, uuid))
    if (!asset) throw new NotFoundException(`Asset ${uuid} not found`)
    return asset
  }

  async findByProgram(programId: number, opts: PaginationOpts = { offset: 0, limit: 50 }) {
    const [countResult] = await this.db.db
      .select({ count: sql<number>`count(*)::int` })
      .from(assets)
      .where(eq(assets.programId, programId))
    const data = await this.db.db
      .select()
      .from(assets)
      .where(eq(assets.programId, programId))
      .limit(opts.limit)
      .offset(opts.offset)
      .orderBy(sql`created_at DESC`)
    return { data, total: countResult.count }
  }

  async create(dto: CreateAssetDto) {
    const [asset] = await this.db.db
      .insert(assets)
      .values({ ...dto, uuid: uuidv4() })
      .returning()
    return asset
  }

  async bulkCreate(dtos: CreateAssetDto[]) {
    const withUuids = dtos.map((dto) => ({ ...dto, uuid: uuidv4() }))
    return this.db.db
      .insert(assets)
      .values(withUuids)
      .returning()
  }

  async update(uuid: string, dto: UpdateAssetDto) {
    const [asset] = await this.db.db
      .update(assets)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(assets.uuid, uuid))
      .returning()
    if (!asset) throw new NotFoundException(`Asset ${uuid} not found`)
    return asset
  }

  async remove(uuid: string) {
    const [asset] = await this.db.db
      .delete(assets)
      .where(eq(assets.uuid, uuid))
      .returning()
    if (!asset) throw new NotFoundException(`Asset ${uuid} not found`)
    return asset
  }
}
