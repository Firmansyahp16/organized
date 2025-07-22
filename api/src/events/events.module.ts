import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../authorization/authorization.module";
import { BranchModule } from "../branch/branch.module";
import { ExaminationsModule } from "../examinations/examinations.module";
import { PrismaModule } from "../prisma/prisma.module";
import { EventsController } from "./events.controller";

@Module({
  imports: [
    PrismaModule,
    AuthorizationModule,
    BranchModule,
    AuthModule,
    ExaminationsModule,
  ],
  controllers: [EventsController],
})
export class EventsModule {}
