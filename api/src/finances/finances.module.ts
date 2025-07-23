import { Module } from "@nestjs/common";
import { AuthorizationModule } from "../authorization/authorization.module";
import { PrismaModule } from "../prisma/prisma.module";
import { FinancesController } from "./finances.controller";
import { FinancesService } from "./finances.service";

@Module({
  imports: [PrismaModule, AuthorizationModule],
  controllers: [FinancesController],
  providers: [FinancesService],
  exports: [FinancesService],
})
export class FinancesModule {}
