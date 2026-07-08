import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from "@nestjs/common"
import { ReconProcessor } from "./recon.processor"
import { ReconService } from "./recon.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("recon")
@UseGuards(JwtAuthGuard)
export class ReconController {
  constructor(
    private readonly reconProcessor: ReconProcessor,
    private readonly reconService: ReconService,
  ) {}

  @Post("scan/:programId")
  async triggerScan(
    @Param("programId", ParseIntPipe) programId: number,
    @Body() body: { domain: string },
  ) {
    const result = await this.reconProcessor.processReconJob(programId, body.domain)
    return {
      message: `Recon complete for ${body.domain}`,
      imported: result.imported,
      total: result.total,
    }
  }

  @Post("daily")
  async triggerDailyRecon() {
    const result = await this.reconProcessor.runDailyRecon()
    return {
      message: `Daily recon complete`,
      ...result,
    }
  }

  @Get("snapshots/:programUuid")
  async getSnapshots(@Param("programUuid") programUuid: string) {
    return this.reconService.getSnapshotsByUuid(programUuid)
  }
}
