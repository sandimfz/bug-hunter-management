import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common"
import { WorkspacesService } from "./workspaces.service"
import { CreateWorkspaceDto } from "./create-workspace.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("workspaces")
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  findMine(@Request() req: { user: { id: number } }) {
    return this.workspacesService.findByOwner(req.user.id)
  }

  @Post()
  create(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create({ ...dto, ownerId: req.user.id })
  }
}
