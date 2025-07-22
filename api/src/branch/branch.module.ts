import { Module } from "@nestjs/common";
import { AuthorizationModule } from "../authorization/authorization.module";
import { PrismaModule } from "../prisma/prisma.module";
import { BranchController } from "./branch.controller";
import { BranchService } from "./branch.service";

@Module({
  imports: [PrismaModule, AuthorizationModule],
  controllers: [BranchController],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule {}
