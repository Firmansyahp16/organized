import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { JwtAuthGuard } from "../auth/auth.guard";
import { MyUserProfile } from "../auth/auth.service";
import { AuthorizationService } from "../authorization/authorization.service";
import { CurrentUser } from "../common/decorators/current.decorator";
import { PrismaService } from "../prisma/prisma.service";

@Controller("Attendances")
export class AttendancesController {
  constructor(
    private prismaService: PrismaService,
    private authorizationService: AuthorizationService
  ) {}

  // Basic CRUD

  @UseGuards(JwtAuthGuard)
  @Get("")
  async getAllAttendances() {
    return await this.prismaService.attendances.findMany();
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getAttendance(@Param("id") id: string) {
    return await this.prismaService.attendances.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async updateAttendance(
    @Param("id") id: string,
    @Body() data: Prisma.AttendancesUpdateInput,
    @CurrentUser() currentUser: MyUserProfile
  ) {
    const attendance = await this.prismaService.attendances.findUniqueOrThrow({
      where: {
        id: id,
      },
      include: {
        schedule: true,
      },
    });
    if (
      !this.authorizationService.isCoach(
        currentUser,
        String(attendance?.schedule?.branchId)
      )
    ) {
      throw new ForbiddenException("You are not authorized");
    }
    return await this.prismaService.attendances.update({
      where: {
        id: id,
      },
      data: data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async removeAttendance(
    @Param("id") id: string,
    @CurrentUser() currentUser: MyUserProfile
  ) {
    const attendance = await this.prismaService.attendances.findUniqueOrThrow({
      where: {
        id: id,
      },
      include: {
        schedule: true,
      },
    });
    if (
      !this.authorizationService.isCoach(
        currentUser,
        String(attendance.schedule?.branchId)
      )
    ) {
      throw new ForbiddenException("You are not authorized");
    }
    return await this.prismaService.attendances.delete({
      where: {
        id: id,
      },
    });
  }
}
