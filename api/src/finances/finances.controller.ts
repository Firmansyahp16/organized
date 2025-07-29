import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
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
import { PrismaService } from "../prisma/prisma.service";
import { FinancesService } from "./finances.service";

@Controller("finances")
export class FinancesController {
  constructor(
    private prismaService: PrismaService,
    private financesService: FinancesService,
    private authorizationService: AuthorizationService
  ) {}

  // Basic CRUD

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body()
    data: {
      type: Flow;
      category: Category;
      subCategory: SubCategory;
      amount: number;
      description: string;
      branchId: string;
    },
    @CurrentUser() currentUser: MyUserProfile
  ) {
    if (
      !this.authorizationService.isBranchSupport(currentUser, data.branchId) &&
      !this.authorizationService.isBranchManager(currentUser, data.branchId)
    ) {
      throw new ForbiddenException("You are not authorized");
    }
    return await this.financesService.createFinance(
      data.type,
      data.category,
      data.subCategory,
      data.amount,
      data.description,
      data.branchId,
      currentUser
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllFinances(
    @CurrentUser() currentUser: MyUserProfile,
    @Body() data?: { branchId: string }
  ) {
    if (data) {
      if (
        !this.authorizationService.isBranchSupport(
          currentUser,
          data.branchId
        ) &&
        !this.authorizationService.isBranchManager(currentUser, data.branchId)
      ) {
        throw new ForbiddenException("You are not authorized");
      }
      return await this.prismaService.finances.findMany({
        where: {
          branchId: data.branchId,
        },
      });
    } else {
      return await this.prismaService.finances.findMany();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getFinance(
    @Param("id") id: string,
    @CurrentUser() currentUser: MyUserProfile
  ) {
    const finance = await this.prismaService.finances.findUniqueOrThrow({
      where: {
        id,
      },
    });
    if (
      !this.authorizationService.isBranchSupport(
        currentUser,
        String(finance.branchId)
      ) &&
      !this.authorizationService.isBranchManager(
        currentUser,
        String(finance.branchId)
      )
    ) {
      throw new ForbiddenException("You are not authorized");
    }
    return finance;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async updateFinance(
    @Param("id") id: string,
    @Body() data: Prisma.FinancesUpdateInput,
    @CurrentUser() currentUser: MyUserProfile
  ) {
    const finance = await this.prismaService.finances.findUniqueOrThrow({
      where: {
        id,
      },
    });
    if (
      !this.authorizationService.isBranchSupport(
        currentUser,
        String(finance.branchId)
      ) &&
      !this.authorizationService.isBranchManager(
        currentUser,
        String(finance.branchId)
      )
    ) {
      throw new ForbiddenException("You are not authorized");
    }
    return await this.prismaService.finances.update({
      where: {
        id,
      },
      data: data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async removeFinance(
    @Param("id") id: string,
    @CurrentUser() currentUser: MyUserProfile
  ) {
    const finance = await this.prismaService.finances.findUniqueOrThrow({
      where: {
        id,
      },
    });
    if (
      !this.authorizationService.isBranchSupport(
        currentUser,
        String(finance.branchId)
      ) &&
      !this.authorizationService.isBranchManager(
        currentUser,
        String(finance.branchId)
      )
    ) {
      throw new ForbiddenException("You are not authorized");
    }
    return await this.prismaService.finances.delete({
      where: {
        id,
      },
    });
  }
}
