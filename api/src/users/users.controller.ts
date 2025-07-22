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
import { Prisma } from "@prisma/client";
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
  async createUser(@Body() data: Prisma.UsersCreateInput) {
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
    const user = await this.prismaService.users.findUnique({
      where: { id: id },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async updateUser(
    @Param("id") id: string,
    @Body()
    data: Prisma.UsersUpdateInput,
    @CurrentUser() currentUser: MyUserProfile
  ) {
    if (
      !this.authorizationService.isCurrentUser(currentUser, id) &&
      !this.authorizationService.isAdmin(currentUser)
    ) {
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
    if (
      !this.authorizationService.isCurrentUser(currentUser, id) &&
      !this.authorizationService.isAdmin(currentUser)
    ) {
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
    const user = await this.prismaService.users.findUnique({
      where: { id: id },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return await this.prismaService.users.update({
      where: { id: id },
      data: {
        branchRoles: [
          ...(user.branchRoles ?? []),
          {
            branchId: data.branchId,
            roles: data.roles,
          },
        ],
      },
    });
  }
}
