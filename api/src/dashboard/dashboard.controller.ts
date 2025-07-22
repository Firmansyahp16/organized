import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/auth.guard";
import { MyUserProfile } from "../auth/auth.service";
import { AuthorizationService } from "../authorization/authorization.service";
import { CurrentUser } from "../common/decorators/current.decorator";
import { PrismaService } from "../prisma/prisma.service";

@Controller("Dashboard")
export class DashboardController {
  constructor(
    private prismaService: PrismaService,
    private authorizationService: AuthorizationService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getDashboard(@CurrentUser() currentUser: MyUserProfile) {
    const dashboardData: {
      totalMembers?: number;
      totalBranches?: number;
      totalCoaches?: number;
      todaySchedules?: {
        branchId: string;
        branchName: string;
        title: string;
        date: Date;
        coaches: {
          id: string;
          name: string;
          rank: string;
        }[];
      }[];
      nextExaminations?: {
        branchId: string;
        branchName: string;
        title: string;
        date: Date;
        totalParticipants: number;
        examiners: {
          id: string;
          name: string;
          rank: string;
        }[];
      }[];
      nextEvents?: {
        branches: {
          id: string;
          name: string;
        }[];
        title: string;
        date: Date;
        type: string;
        totalParticipants: number;
      }[];
    } = {};
    const allUsers = await this.prismaService.users.findMany();
    const allBranches = await this.prismaService.branch.findMany();
    const allSchedules = await this.prismaService.schedules.findMany();
    const allExaminations = await this.prismaService.examinations.findMany();
    const allEvents = await this.prismaService.events.findMany();
    if (this.authorizationService.isAdmin(currentUser)) {
      dashboardData.totalMembers = allUsers.filter((u) =>
        u.branchRoles?.some((br) => br.branchId && br.roles?.includes("member"))
      ).length;
      dashboardData.totalBranches = allBranches.length;
      dashboardData.totalCoaches = allUsers.filter((u) =>
        u.branchRoles?.some((br) => br.branchId && br.roles?.includes("coach"))
      ).length;
      dashboardData.todaySchedules = allSchedules
        .filter(
          (s) =>
            s.date?.toLocaleDateString() === new Date().toLocaleDateString()
        )
        .map((schedule) => {
          const coaches = allUsers.filter((u) =>
            u.branchRoles?.some((br) => br.branchId === schedule.branchId)
          );
          return {
            branchId: String(schedule.branchId),
            branchName: String(
              allBranches.find((b) => b.id === schedule.branchId)?.name
            ),
            title: String(schedule.title),
            date: schedule.date as Date,
            coaches: coaches.map((u) => ({
              id: String(u.id),
              name: String(u.fullName),
              rank: String(u.rank),
            })),
          };
        });
      dashboardData.nextExaminations = allExaminations
        .filter(
          (e) =>
            e.date?.toLocaleDateString() === new Date().toLocaleDateString()
        )
        .map((event) => {
          const examiners = allUsers.filter((u) =>
            u.branchRoles?.some((br) => br.branchId === event.branchId)
          );
          return {
            branchId: String(event.branchId),
            branchName: String(
              allBranches.find((b) => b.id === event.branchId)?.name
            ),
            title: String(event.title),
            date: event.date as Date,
            examiners: examiners.map((u) => ({
              id: String(u.id),
              name: String(u.fullName),
              rank: String(u.rank),
            })),
            totalParticipants: event.participants?.length,
          };
        });
      dashboardData.nextEvents = allEvents
        .filter(
          (e) =>
            e.date?.toLocaleDateString() === new Date().toLocaleDateString()
        )
        .map((event) => ({
          branches: allBranches
            .filter((b) => event.branchIds?.includes(String(b?.id)))
            .map((b) => ({ id: String(b.id), name: String(b.name) })),
          title: String(event.title),
          date: event.date as Date,
          type: String(event.type),
          totalParticipants: event.participants?.length,
        }));
    }
    return dashboardData;
  }
}
