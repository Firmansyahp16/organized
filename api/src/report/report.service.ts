import { BadRequestException, Injectable } from "@nestjs/common";
import { BranchService } from "../branch/branch.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReportService {
  constructor(
    private prismaService: PrismaService,
    private branchService: BranchService
  ) {}
  async generateReport(
    branchId?: string,
    type?: string,
    startDate?: string,
    endDate?: string
  ) {
    let result: Record<string, any> = {};
    if (type === "memberReport") {
      if (!branchId) {
        throw new BadRequestException("Branch ID is required");
      }
      const members = await this.branchService.findMembers(branchId);
      const attendances = await this.prismaService.attendances.findMany({
        where: {
          details: {
            some: {
              id: {
                in: members.map((m) => m.id),
              },
            },
          },
        },
      });
      for (const member of members) {
        const memberId = member.id;
        result[memberId] = {};
        for (const attendance of attendances) {
          const yearMonth = `${(attendance.createdAt as Date).getFullYear()}-${
            (attendance.createdAt as Date).getMonth() + 1
          }`;
          const details = attendance.details.find((d) => d.id === memberId);
          if (!result[memberId][yearMonth]) {
            result[memberId][yearMonth] = {
              present: 0,
              absence: 0,
            };
          }
          if (details) {
            if (details.status === "present") {
              result[memberId][yearMonth].present += 1;
            } else {
              result[memberId][yearMonth].absence += 1;
            }
          }
        }
      }
    }
    if (type === "branchReport") {
      if (!branchId) {
        throw new BadRequestException("Branch ID is required");
      }
      const members = await this.branchService.findMembers(branchId);
      const coaches = await this.branchService.findCoaches(branchId);
      const supports = await this.branchService.findSupports(branchId);
      const finances = await this.prismaService.finances.findMany({
        where: {
          branchId: branchId,
        },
      });
      result = {
        members: members.length,
        coaches: coaches.length,
        supports: supports.length,
        finances: finances,
      };
    }
    return result;
  }
}
