import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { AuthorizationModule } from './authorization/authorization.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BranchModule } from './branch/branch.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AttendancesModule } from './attendances/attendances.module';
import { ExaminationsModule } from './examinations/examinations.module';
import { EventsModule } from './events/events.module';
import { FinancesModule } from './finances/finances.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), UsersModule, AuthModule, AuthorizationModule, DashboardModule, BranchModule, SchedulesModule, AttendancesModule, ExaminationsModule, EventsModule, FinancesModule],
})
export class AppModule {}
