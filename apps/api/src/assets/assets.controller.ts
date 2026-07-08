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
} from "@nestjs/common"
import { AssetsService } from "./assets.service"
import { CreateAssetDto } from "./dto/create-asset.dto"
import { BulkImportAssetDto } from "./dto/bulk-import-asset.dto"
import { UpdateAssetDto } from "./dto/update-asset.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("assets")
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAll(
    @Request() req: { user: { id: number } },
    @Query("programId") programId?: string,
    @Query("offset") offset?: string,
    @Query("limit") limit?: string,
  ) {
    const opts = {
      offset: offset ? +offset : 0,
      limit: limit ? Math.min(+limit, 100) : 50,
    }
    if (programId) {
      return this.assetsService.findByProgram(+programId, opts)
    }
    return this.assetsService.findByUser(req.user.id, opts)
  }

  @Get(":uuid")
  findOne(@Param("uuid") uuid: string) {
    return this.assetsService.findOne(uuid)
  }

  @Post()
  create(@Body() dto: CreateAssetDto) {
    return this.assetsService.create(dto)
  }

  @Post("bulk-import")
  bulkImport(@Body() dto: BulkImportAssetDto) {
    const dtos = dto.values.map((value) => ({
      programId: dto.programId,
      type: dto.type,
      value,
      status: dto.status,
      tags: dto.tags,
    }))
    return this.assetsService.bulkCreate(dtos)
  }

  @Put(":uuid")
  update(
    @Param("uuid") uuid: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.assetsService.update(uuid, dto)
  }

  @Delete(":uuid")
  remove(@Param("uuid") uuid: string) {
    return this.assetsService.remove(uuid)
  }
}
