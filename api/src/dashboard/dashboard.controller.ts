import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/auth.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("Dashboard")
export class DashboardController {
  constructor(private prismaService: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getDashboard() {
    const dashboardData: {
      totalMembers?: number;
      totalBranches?: number;
      totalCoaches?: number;
      todaySchedules?: {
        branchId: string;
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
        branches: string[];
        title: string;
        date: Date;
        type: string;
        totalParticipants: number;
      }[];
    } = {};
    const [branches, users, schedules, events, examinations] =
      await Promise.all([
        this.prismaService.branch.findMany(),
        this.prismaService.users.findMany(),
        this.prismaService.schedules.findMany(),
        this.prismaService.events.findMany(),
        this.prismaService.examinations.findMany(),
      ]);
    dashboardData.totalMembers = users.filter((u) =>
      u.branchRoles?.some((br) => br.branchId && br.roles?.includes("member"))
    ).length;
    dashboardData.totalBranches = branches.length;
    dashboardData.totalCoaches = users.filter((u) =>
      u.branchRoles?.some((br) => br.branchId && br.roles?.includes("coach"))
    ).length;
    dashboardData.todaySchedules = schedules
      .filter(
        (s) => s.date?.toLocaleDateString() === new Date().toLocaleDateString()
      )
      .map((schedule) => {
        const coaches = users.filter((u) =>
          u.branchRoles?.some((br) => br.branchId === schedule.branchId)
        );
        return {
          branchId: String(schedule.branchId),
          title: String(schedule.title),
          date: schedule.date as Date,
          coaches: coaches.map((u) => ({
            id: String(u.id),
            name: String(u.fullName),
            rank: String(u.rank),
          })),
        };
      });
    dashboardData.nextExaminations = examinations
      .filter(
        (e) => e.date?.toLocaleDateString() === new Date().toLocaleDateString()
      )
      .map((event) => {
        const examiners = users.filter((u) =>
          u.branchRoles?.some((br) => br.branchId === event.branchId)
        );
        return {
          branchId: String(event.branchId),
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
    dashboardData.nextEvents = events
      .filter(
        (e) => e.date?.toLocaleDateString() === new Date().toLocaleDateString()
      )
      .map((event) => ({
        branches: branches
          .filter((b) => event.branchIds?.includes(String(b?.id)))
          .map((b) => b.id),
        title: String(event.title),
        date: event.date as Date,
        type: String(event.type),
        totalParticipants: event.participants?.length,
      }));
    return dashboardData;
  }
}
