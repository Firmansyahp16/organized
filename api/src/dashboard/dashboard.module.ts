import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../authorization/authorization.module";
import { PrismaModule } from "../prisma/prisma.module";
import { DashboardController } from "./dashboard.controller";

@Module({
  controllers: [DashboardController],
  imports: [PrismaModule, AuthModule, AuthorizationModule],
})
export class DashboardModule {}
