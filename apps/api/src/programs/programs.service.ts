import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import { eq, sql } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import { DatabaseService } from "../database/database.service"
import { programs, workspaces } from "../database/schema"
import { CreateProgramDto } from "./dto/create-program.dto"
import { UpdateProgramDto } from "./dto/update-program.dto"

interface PaginationOpts {
  offset: number
  limit: number
}

@Injectable()
export class ProgramsService {
  constructor(private readonly db: DatabaseService) {}

  async findByUser(userId: number, opts: PaginationOpts = { offset: 0, limit: 50 }) {
    const baseQuery = this.db.db
      .select({
        id: programs.id,
        uuid: programs.uuid,
        workspaceId: programs.workspaceId,
        name: programs.name,
        platform: programs.platform,
        status: programs.status,
        scopeNotes: programs.scopeNotes,
        createdAt: programs.createdAt,
        updatedAt: programs.updatedAt,
      })
      .from(programs)
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))

    const [countResult] = await this.db.db
      .select({ count: sql<number>`count(*)::int` })
      .from(programs)
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.ownerId, userId))

    const data = await baseQuery
      .limit(opts.limit)
      .offset(opts.offset)
      .orderBy(sql`programs.created_at DESC`)

    return { data, total: countResult.count }
  }

  async findOne(uuid: string) {
    const [program] = await this.db.db
      .select()
      .from(programs)
      .where(eq(programs.uuid, uuid))
    if (!program) throw new NotFoundException(`Program ${uuid} not found`)
    return program
  }

  async findByWorkspaceUuid(workspaceUuid: string, opts: PaginationOpts = { offset: 0, limit: 50 }) {
    const [countResult] = await this.db.db
      .select({ count: sql<number>`count(*)::int` })
      .from(programs)
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.uuid, workspaceUuid))

    const data = await this.db.db
      .select({
        id: programs.id,
        uuid: programs.uuid,
        workspaceId: programs.workspaceId,
        name: programs.name,
        platform: programs.platform,
        status: programs.status,
        scopeNotes: programs.scopeNotes,
        createdAt: programs.createdAt,
        updatedAt: programs.updatedAt,
      })
      .from(programs)
      .innerJoin(workspaces, eq(programs.workspaceId, workspaces.id))
      .where(eq(workspaces.uuid, workspaceUuid))
      .limit(opts.limit)
      .offset(opts.offset)
      .orderBy(sql`programs.created_at DESC`)

    return { data, total: countResult.count }
  }

  async create(dto: CreateProgramDto, userId: number) {
    const [workspace] = await this.db.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.uuid, dto.workspaceUuid))

    if (!workspace) {
      throw new NotFoundException(`Workspace ${dto.workspaceUuid} not found`)
    }
    if (workspace.ownerId !== userId) {
      throw new ForbiddenException("You do not own this workspace")
    }

    const { workspaceUuid: _, ...rest } = dto
    const [program] = await this.db.db
      .insert(programs)
      .values({ ...rest, workspaceId: workspace.id, uuid: uuidv4() })
      .returning()
    return program
  }

  async update(uuid: string, dto: UpdateProgramDto) {
    const [program] = await this.db.db
      .update(programs)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(programs.uuid, uuid))
      .returning()
    if (!program) throw new NotFoundException(`Program ${uuid} not found`)
    return program
  }

  async remove(uuid: string) {
    const [program] = await this.db.db
      .delete(programs)
      .where(eq(programs.uuid, uuid))
      .returning()
    if (!program) throw new NotFoundException(`Program ${uuid} not found`)
    return program
  }
}
