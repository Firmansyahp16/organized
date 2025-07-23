import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Category, Flow, Prisma, SubCategory } from "@prisma/client";
import { JwtAuthGuard } from "../auth/auth.guard";
import { MyUserProfile } from "../auth/auth.service";
import { CurrentUser } from "../common/decorators/current.decorator";
import { generateID } from "../libs/generateID";
import { PrismaService } from "../prisma/prisma.service";
import { FinancesService } from "./finances.service";

@Controller("finances")
export class FinancesController {
  constructor(
    private prismaService: PrismaService,
    private financesService: FinancesService
  ) {}

  // Basic CRUD

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() data: Prisma.FinancesCreateInput) {
    return await this.prismaService.finances.create({
      data: {
        ...data,
        id: generateID("FIN"),
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get("")
  async getAllFinances() {
    return await this.prismaService.finances.findMany();
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getFinance(@Body("id") id: string) {
    return await this.prismaService.finances.findUnique({
      where: {
        id,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async updateFinance(
    @Body("id") id: string,
    @Body() data: Prisma.FinancesUpdateInput
  ) {
    return await this.prismaService.finances.update({
      where: {
        id,
      },
      data: data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id")
  async removeFinance(@Body("id") id: string) {
    return await this.prismaService.finances.delete({
      where: {
        id,
      },
    });
  }

  // Custom Endpoints

  @UseGuards(JwtAuthGuard)
  @Post(":id/transactions")
  async createTransaction(
    @Param("id") id: string,
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
}
