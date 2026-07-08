import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UsePipes,
} from "@nestjs/common"
import { ProgramsService } from "./programs.service"
import { createProgramSchema } from "./dto/create-program.dto"
import { UpdateProgramDto } from "./dto/update-program.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe"

@Controller("programs")
@UseGuards(JwtAuthGuard)
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  findAll(
    @Request() req: { user: { id: number } },
    @Query("workspaceUuid") workspaceUuid?: string,
    @Query("offset") offset?: string,
    @Query("limit") limit?: string,
  ) {
    const opts = {
      offset: offset ? +offset : 0,
      limit: limit ? Math.min(+limit, 100) : 50,
    }
    if (workspaceUuid) {
      return this.programsService.findByWorkspaceUuid(workspaceUuid, opts)
    }
    return this.programsService.findByUser(req.user.id, opts)
  }

  @Get(":uuid")
  findOne(@Param("uuid") uuid: string) {
    return this.programsService.findOne(uuid)
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createProgramSchema))
  create(
    @Body() dto: { workspaceUuid: string; name: string; platform: string; status?: string; scopeNotes?: string },
    @Request() req: { user: { id: number } },
  ) {
    return this.programsService.create(dto as any, req.user.id)
  }

  @Put(":uuid")
  update(
    @Param("uuid") uuid: string,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.programsService.update(uuid, dto)
  }

  @Delete(":uuid")
  remove(@Param("uuid") uuid: string) {
    return this.programsService.remove(uuid)
  }
}
