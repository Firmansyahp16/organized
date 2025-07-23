import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Category, Flow, Prisma, SubCategory } from "@prisma/client";
import { JwtAuthGuard } from "../auth/auth.guard";
import { MyUserProfile } from "../auth/auth.service";
import { AuthorizationService } from "../authorization/authorization.service";
import { CurrentUser } from "../common/decorators/current.decorator";
import { FinancesService } from "../finances/finances.service";
import { generateID } from "../libs/generateID";
import { PrismaService } from "../prisma/prisma.service";
import { BranchService } from "./branch.service";

@Controller("Branch")
export class BranchController {
  constructor(
    private prismaService: PrismaService,
    private authorizationService: AuthorizationService,
    private branchService: BranchService,
    private financesService: FinancesService
  ) {}

  // Basic CRUD

  @UseGuards(JwtAuthGuard)
  @Post()
  async createBranch(@Body() data: Prisma.BranchCreateInput) {
    return await this.prismaService.branch.create({
      data: {
        ...data,
        id: generateID("BRN"),
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllBranches() {
    return await this.prismaService.branch.findMany();
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getBranch(@Param("id") id: string) {
    return await this.prismaService.branch.findUniqueOrThrow({
      where: { id: id },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async updateBranch(
    @Param("id") id: string,
    @Body() data: Prisma.BranchUpdateInput,
    @CurrentUser() currentUser: MyUserProfile
  ) {
    if (
      !this.authorizationService.isAdmin(currentUser) &&
      !this.authorizationService.isBranchManagerOfBranch(currentUser, id)
    ) {
      throw new ForbiddenException("You are not authorized");
    }
    return await this.prismaService.branch.update({
      where: { id: id },
      data: data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async removeBranch(
    @Param("id") id: string,
    @CurrentUser() currentUser: MyUserProfile
  ) {
    if (
      !this.authorizationService.isAdmin(currentUser) &&
      !this.authorizationService.isBranchManagerOfBranch(currentUser, id)
    ) {
      throw new ForbiddenException("You are not authorized");
    }
    return await this.prismaService.branch.delete({
      where: { id: id },
    });
  }

  // Custom Endpoints

  @UseGuards(JwtAuthGuard)
  @Get(":id/members")
  async getBranchMembers(@Param("id") id: string) {
    return await this.branchService.findMembers(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id/coaches")
  async getBranchCoaches(@Param("id") id: string) {
    return await this.branchService.findCoaches(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/setCoach")
  async setCoach(
    @Param("id") id: string,
    @Body() data: { coachIds: string[] },
    @CurrentUser() currentUser: MyUserProfile
  ) {
    if (
      !this.authorizationService.isAdmin(currentUser) &&
      !this.authorizationService.isBranchManagerOfBranch(currentUser, id) &&
      !this.authorizationService.isCoachManager(currentUser)
    ) {
      throw new ForbiddenException("You are not authorized");
    }

    const { coachIds } = data;

    const branch = await this.prismaService.branch.findUnique({
      where: { id: id },
    });
    if (!branch) {
      throw new NotFoundException("Branch not found");
    }

    const oldCoachIds = branch.coachIds ?? [];

    for (const oldId of oldCoachIds) {
      if (!coachIds.includes(oldId)) {
        const coach = await this.prismaService.users.findUnique({
          where: { id: oldId },
        });

        if (!coach) {
          throw new NotFoundException("Coach not found");
        }

        const branchRoles = coach?.branchRoles ?? [];

        const updatedBranchRoles = branchRoles
          .map((br) => {
            if (br.branchId === id) {
              return {
                branchId: br.branchId,
                roles: (br.roles ?? []).filter((role) => role !== "coach"),
              };
            }
            return br;
          })
          .filter((br) => (br.roles?.length ?? 0) > 0);

        const globalRoles = coach.globalRoles ?? [];

        if (!globalRoles.includes("unassignedCoach")) {
          globalRoles.push("unassignedCoach");
        }

        await this.prismaService.users.update({
          where: {
            id: oldId,
          },
          data: {
            branchRoles: updatedBranchRoles,
            globalRoles,
          },
        });
      }
    }

    for (const coachId of coachIds) {
      const coach = await this.prismaService.users.findUnique({
        where: { id: coachId },
      });

      if (!coach) {
        throw new NotFoundException("Coach not found");
      }

      const branchRoles = coach?.branchRoles ?? [];

      const branchEntry = branchRoles.find((br) => br.branchId === id);

      if (branchEntry) {
        branchEntry.roles = Array.from(
          new Set([...(branchEntry.roles ?? []), "coach"])
        );
      } else {
        branchRoles.push({
          branchId: id,
          roles: ["coach"],
        });
      }

      await this.prismaService.users.update({
        where: {
          id: coachId,
        },
        data: {
          branchRoles,
          globalRoles: coach.globalRoles.filter(
            (role) => role !== "unassignedCoach"
          ),
        },
      });
    }

    await this.prismaService.branch.update({
      where: { id: id },
      data: {
        coachIds,
      },
    });

    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/setSchedule")
  async setSchedule(
    @Param("id") id: string,
    @Body()
    data: {
      count: number;
      startDate: string;
      resetSchedule: boolean;
    },
    @CurrentUser() currentUser: MyUserProfile
  ) {
    if (!this.authorizationService.isCoachOfBranch(currentUser, id)) {
      throw new ForbiddenException("You are not authorized");
    }
    await this.prismaService.branch.findUnique({
      where: { id: id },
    });
    const { count, startDate, resetSchedule } = data;
    const parsedStartDate = new Date(startDate);
    let startIndex = 1;
    const existingSchedules = await this.prismaService.schedules.findMany({
      where: {
        branchId: id,
      },
    });
    if (!resetSchedule && existingSchedules.length > 0) {
      let maxIndex = 0;
      for (const sched of existingSchedules) {
        const match = sched.id?.match(/-(\d{2})$/);
        const number = match ? parseInt(match[1], 10) : NaN;
        if (!isNaN(number) && number > maxIndex) {
          maxIndex = number;
        }
      }
      startIndex = maxIndex + 1;
    } else if (resetSchedule && existingSchedules.length > 0) {
      await this.prismaService.schedules.deleteMany({
        where: {
          branchId: id,
        },
      });
    }
    for (let i = 0; i < count; i++) {
      const index = startIndex + i;
      const paddedIndex = index.toString().padStart(2, "0");
      const date = new Date(parsedStartDate.getTime());
      date.setDate(parsedStartDate.getDate() + i * 7);
      await this.prismaService.schedules.create({
        data: {
          id: `${id}-${paddedIndex}`,
          title: `Schedule ${index}`,
          date,
          branchId: id,
        },
      });
    }
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/setExam")
  async setExam(
    @Param("id") id: string,
    @Body()
    data: {
      title: string;
      date: string;
      examiners: string[];
    },
    @CurrentUser() currentUser: MyUserProfile
  ) {
    if (!this.authorizationService.isCoachOfBranch(currentUser, id)) {
      throw new ForbiddenException("You are not authorized");
    }
    await this.prismaService.branch.findUniqueOrThrow({
      where: { id: id },
    });
    const { title, date, examiners } = data;
    const parsedDate = new Date(date);
    await this.prismaService.examinations.create({
      data: {
        id: generateID("EXM"),
        title,
        date: parsedDate,
        branchId: id,
        examiners,
      },
    });
    return true;
  }

  // Financing

  @UseGuards(JwtAuthGuard)
  @Get(":id/finances")
  async getFinances(@Param("id") id: string) {
    const funds = await this.prismaService.branch.findFirstOrThrow({
      where: {
        id: id,
      },
      select: {
        funds: true,
      },
    });
    const finances = await this.prismaService.finances.findMany({
      where: {
        branchId: id,
      },
      select: {
        id: true,
        date: true,
        type: true,
        category: true,
        subCategory: true,
        amount: true,
        description: true,
      },
    });
    return {
      funds: funds.funds,
      finances,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/finances")
  async getFinance(
    @Param("id") id: string,
    @Body()
    data: {
      type: Flow;
      category: Category;
      subCategory: SubCategory;
      amount: number;
      description: string;
    },
    @CurrentUser() currentUser: MyUserProfile
  ) {
    return await this.financesService.createFinance(
      data.type,
      data.category,
      data.subCategory,
      data.amount,
      data.description,
      id,
      currentUser
    );
  }
}
