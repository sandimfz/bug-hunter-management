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
import { FindingsService } from "./findings.service"
import { CreateFindingDto } from "./dto/create-finding.dto"
import { UpdateFindingDto } from "./dto/update-finding.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("findings")
@UseGuards(JwtAuthGuard)
export class FindingsController {
  constructor(private readonly findingsService: FindingsService) {}

  @Get()
  findAll(
    @Request() req: { user: { id: number } },
    @Query("assetId") assetId?: string,
    @Query("assetUuid") assetUuid?: string,
    @Query("offset") offset?: string,
    @Query("limit") limit?: string,
  ) {
    const opts = {
      offset: offset ? +offset : 0,
      limit: limit ? Math.min(+limit, 100) : 50,
    }
    if (assetUuid) {
      return this.findingsService.findByAssetUuid(assetUuid, opts)
    }
    if (assetId) {
      return this.findingsService.findByAsset(+assetId, opts)
    }
    return this.findingsService.findByUser(req.user.id, opts)
  }

  @Get(":uuid")
  findOne(@Param("uuid") uuid: string) {
    return this.findingsService.findOne(uuid)
  }

  @Post()
  create(@Body() dto: CreateFindingDto) {
    return this.findingsService.create(dto)
  }

  @Put(":uuid")
  update(
    @Param("uuid") uuid: string,
    @Body() dto: UpdateFindingDto,
  ) {
    return this.findingsService.update(uuid, dto)
  }

  @Delete(":uuid")
  remove(@Param("uuid") uuid: string) {
    return this.findingsService.remove(uuid)
  }
}
