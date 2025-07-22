import { Module } from "@nestjs/common";
import { AuthorizationModule } from "../authorization/authorization.module";
import { PrismaModule } from "../prisma/prisma.module";
import { AttendancesController } from "./attendances.controller";

@Module({
  imports: [PrismaModule, AuthorizationModule],
  controllers: [AttendancesController],
})
export class AttendancesModule {}
