import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { DatabaseModule } from "./database/database.module"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { WorkspacesModule } from "./workspaces/workspaces.module"
import { ProgramsModule } from "./programs/programs.module"
import { AssetsModule } from "./assets/assets.module"
import { FindingsModule } from "./findings/findings.module"
import { StatsModule } from "./stats/stats.module"
import { SearchModule } from "./search/search.module"
import { ReportsModule } from "./reports/reports.module"
import { ReconModule } from "./recon/recon.module"
import { NotificationsModule } from "./notifications/notifications.module"

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    ProgramsModule,
    AssetsModule,
    FindingsModule,
    StatsModule,
    SearchModule,
    ReportsModule,
    ReconModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
