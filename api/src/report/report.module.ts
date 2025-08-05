import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../authorization/authorization.module";
import { BranchModule } from "../branch/branch.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ReportController } from "./report.controller";
import { ReportService } from "./report.service";

@Module({
  imports: [PrismaModule, AuthModule, AuthorizationModule, BranchModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
