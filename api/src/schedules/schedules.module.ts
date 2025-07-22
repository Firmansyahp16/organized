import { Module } from "@nestjs/common";
import { AuthorizationModule } from "../authorization/authorization.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SchedulesController } from "./schedules.controller";

@Module({
  imports: [PrismaModule, AuthorizationModule],
  controllers: [SchedulesController],
})
export class SchedulesModule {}
