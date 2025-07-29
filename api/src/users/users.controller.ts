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
import { Prisma, RolesForBranch } from "@prisma/client";
import { JwtAuthGuard } from "../auth/auth.guard";
import { MyUserProfile } from "../auth/auth.service";
import { AuthorizationService } from "../authorization/authorization.service";
import { CurrentUser } from "../common/decorators/current.decorator";
import { generateID } from "../libs/generateID";
import { PrismaService } from "../prisma/prisma.service";

@Controller("Users")
export class UsersController {
  constructor(
    private readonly prismaService: PrismaService,
    private authorizationService: AuthorizationService
  ) {}

  // Basic CRUD

  @UseGuards(JwtAuthGuard)
  @Post()
  async createUser(
    @Body() data: Prisma.UsersCreateInput,
    @CurrentUser() currentUser: MyUserProfile
  ) {
    if (
      !this.authorizationService.isAdmin(currentUser) &&
      !this.authorizationService.isCoachManager(currentUser)
    ) {
      throw new ForbiddenException("You are not authorized");
    }
    return await this.prismaService.users.create({
      data: {
        ...data,
        id: generateID("USR"),
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers() {
    return await this.prismaService.users.findMany();
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getUser(@Param("id") id: string) {
    return await this.prismaService.users.findUniqueOrThrow({
      where: { id: id },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async updateUser(
    @Param("id") id: string,
    @Body()
    data: Prisma.UsersUpdateInput,
    @CurrentUser() currentUser: MyUserProfile
  ) {
    if (!this.authorizationService.isCurrentUser(currentUser, id)) {
      throw new ForbiddenException("You are not authorized");
    }
    return await this.prismaService.users.update({
      where: { id: id },
      data: data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async removeUser(
    @Param("id") id: string,
    @CurrentUser() currentUser: MyUserProfile
  ) {
    if (!this.authorizationService.isCurrentUser(currentUser, id)) {
      throw new ForbiddenException("You are not authorized");
    }
    return await this.prismaService.users.delete({
      where: { id: id },
    });
  }

  // Custom Endpoints

  @UseGuards(JwtAuthGuard)
  @Post(":id/setBranch")
  async setBranch(
    @Param("id") id: string,
    @Body()
    data: {
      branchId: string;
      roles?: string[];
    },
    @CurrentUser() currentUser: MyUserProfile
  ) {
    if (!this.authorizationService.isCurrentUser(currentUser, id)) {
      throw new ForbiddenException("You are not authorized");
    }
    const user = await this.prismaService.users.findUniqueOrThrow({
      where: { id: id },
    });
    const validRoles: RolesForBranch[] = (data.roles ?? []).filter((role) =>
      ["member", "branchManager", "branchSupport", "coach"].includes(role)
    ) as RolesForBranch[];
    const existing = user.branchRoles?.find(
      (br) => br.branchId === data.branchId
    );
    let updatedBranchRoles: typeof user.branchRoles;
    if (existing) {
      const newRoles = Array.from(new Set([...existing.roles, ...validRoles]));
      updatedBranchRoles = user.branchRoles.map((br) =>
        br.branchId === data.branchId
          ? { branchId: br.branchId, roles: newRoles }
          : br
      );
    } else {
      updatedBranchRoles = [
        ...(user.branchRoles ?? []),
        {
          branchId: data.branchId,
          roles: validRoles,
        },
      ];
    }
    return await this.prismaService.users.update({
      where: { id: id },
      data: {
        branchRoles: updatedBranchRoles,
      },
    });
  }
}
