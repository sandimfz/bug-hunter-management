import { Injectable, NotFoundException } from "@nestjs/common"
import { eq } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import { DatabaseService } from "../database/database.service"
import { workspaces } from "../database/schema"
import { CreateWorkspaceDto } from "./create-workspace.dto"

@Injectable()
export class WorkspacesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.db.select().from(workspaces)
  }

  async findOne(id: number) {
    const [workspace] = await this.db.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id))
    if (!workspace) throw new NotFoundException(`Workspace #${id} not found`)
    return workspace
  }

  async findByUuid(uuid: string) {
    const [workspace] = await this.db.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.uuid, uuid))
    if (!workspace) throw new NotFoundException(`Workspace ${uuid} not found`)
    return workspace
  }

  async findByOwner(ownerId: number) {
    return this.db.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerId, ownerId))
  }

  async create(dto: CreateWorkspaceDto) {
    const [workspace] = await this.db.db
      .insert(workspaces)
      .values({ ...dto, uuid: uuidv4() })
      .returning()
    return workspace
  }
}
