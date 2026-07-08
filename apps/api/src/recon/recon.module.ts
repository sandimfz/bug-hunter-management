import { Module } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { ReconService } from "./recon.service"
import { ReconProcessor } from "./recon.processor"
import { ReconController } from "./recon.controller"
import { ReconScheduler } from "./recon.scheduler"
import { AssetsModule } from "../assets/assets.module"
import { NotificationsModule } from "../notifications/notifications.module"
import { DatabaseModule } from "../database/database.module"

@Module({
  imports: [ScheduleModule.forRoot(), AssetsModule, NotificationsModule, DatabaseModule],
  controllers: [ReconController],
  providers: [ReconService, ReconProcessor, ReconScheduler],
  exports: [ReconService],
})
export class ReconModule {}
