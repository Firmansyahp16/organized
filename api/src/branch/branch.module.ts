import { Module } from "@nestjs/common";
import { AuthorizationModule } from "../authorization/authorization.module";
import { FinancesModule } from "../finances/finances.module";
import { PrismaModule } from "../prisma/prisma.module";
import { BranchController } from "./branch.controller";
import { BranchService } from "./branch.service";

@Module({
  imports: [PrismaModule, AuthorizationModule, FinancesModule],
  controllers: [BranchController],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule {}
