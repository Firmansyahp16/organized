import { ForbiddenException, Injectable } from "@nestjs/common";
import { Category, Flow, SubCategory } from "@prisma/client";
import { MyUserProfile } from "../auth/auth.service";
import { AuthorizationService } from "../authorization/authorization.service";
import { generateID } from "../libs/generateID";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FinancesService {
  constructor(
    private prismaService: PrismaService,
    private authorizationService: AuthorizationService
  ) {}
  async createFinance(
    type: Flow,
    category: Category,
    subCategory: SubCategory,
    amount: number,
    description: string,
    branchId: string,
    currentUser: MyUserProfile
  ) {
    if (
      !this.authorizationService.isAdmin(currentUser) &&
      !this.authorizationService.isBranchManager(currentUser, branchId) &&
      !this.authorizationService.isBranchSupport(currentUser, branchId)
    ) {
      throw new ForbiddenException("You are not authorized");
    }
    await this.prismaService.finances.create({
      data: {
        id: generateID("FIN"),
        type,
        category,
        subCategory,
        amount,
        description,
        branchId,
      },
    });
    const branch = await this.prismaService.branch.findUniqueOrThrow({
      where: {
        id: branchId,
      },
      select: {
        funds: true,
      },
    });
    if (type === "credit") {
      const updatedCurrent = Number(branch?.funds?.current) + amount;
      const updatedInflow = Number(branch?.funds?.inflow) + amount;
      await this.prismaService.branch.update({
        where: {
          id: branchId,
        },
        data: {
          funds: {
            current: updatedCurrent,
            inflow: updatedInflow,
          },
        },
      });
    } else if (type === "debit") {
      const updatedCurrent = Number(branch?.funds?.current) - amount;
      const updatedOutflow = Number(branch?.funds?.outflow) + amount;
      await this.prismaService.branch.update({
        where: {
          id: branchId,
        },
        data: {
          funds: {
            current: updatedCurrent,
            outflow: updatedOutflow,
          },
        },
      });
    }
    return true;
  }
}
