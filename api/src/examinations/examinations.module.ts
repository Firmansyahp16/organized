import { Module } from "@nestjs/common";
import { AuthorizationModule } from "../authorization/authorization.module";
import { BranchModule } from "../branch/branch.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ExaminationsController } from "./examinations.controller";
import { ExaminationsService } from "./examinations.service";

@Module({
  imports: [PrismaModule, AuthorizationModule, BranchModule],
  controllers: [ExaminationsController],
  providers: [ExaminationsService],
  exports: [ExaminationsService],
})
export class ExaminationsModule {}
