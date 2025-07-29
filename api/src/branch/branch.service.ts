import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BranchService {
  constructor(private prismaService: PrismaService) {}

  async findMembers(id: string) {
    return await this.prismaService.users.findMany({
      where: {
        branchRoles: {
          some: {
            branchId: id,
            roles: {
              has: "member",
            },
          },
        },
      },
    });
  }

  async findCoaches(id: string) {
    return await this.prismaService.users.findMany({
      where: {
        branchRoles: {
          some: {
            branchId: id,
            roles: {
              has: "coach",
            },
          },
        },
      },
    });
  }

  async findSupports(id: string) {
    return await this.prismaService.users.findMany({
      where: {
        branchRoles: {
          some: {
            branchId: id,
            roles: {
              hasSome: ["branchSupport", "branchManager"],
            },
          },
        },
      },
    });
  }
}
