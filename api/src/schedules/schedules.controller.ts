import {
  BadRequestException,
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
import { Prisma } from "@prisma/client";
import { JwtAuthGuard } from "../auth/auth.guard";
import { MyUserProfile } from "../auth/auth.service";
import { AuthorizationService } from "../authorization/authorization.service";
import { CurrentUser } from "../common/decorators/current.decorator";
import { generateID } from "../libs/generateID";
import { PrismaService } from "../prisma/prisma.service";

@Controller("Schedules")
export class SchedulesController {
  constructor(
    private prismaService: PrismaService,
    private authorizationService: AuthorizationService
  ) {}

  // Basic CRUD

  @UseGuards(JwtAuthGuard)
  @Get()
  async getSchedules() {
    return await this.prismaService.schedules.findMany();
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getSchedulesByBranch(@Param("id") id: string) {
    return await this.prismaService.schedules.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async updateSchedule(
    @Param("id") id: string,
    @Body() data: Prisma.SchedulesUpdateInput
  ) {
    return await this.prismaService.schedules.update({
      where: {
        id: id,
      },
      data: data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async removeSchedule(@Param("id") id: string) {
    return await this.prismaService.schedules.delete({
      where: {
        id: id,
      },
    });
  }

  // Custom Endpoints

  @UseGuards(JwtAuthGuard)
  @Post(":id/setAttendances")
  async setAttendances(
    @Param("id") id: string,
    @Body() data: { id: string; status: "present" | "absence" }[],
    @CurrentUser() currentUser: MyUserProfile
  ) {
    await this.prismaService.schedules.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
    if (!this.authorizationService.isCoachOfBranch(currentUser, id)) {
      throw new ForbiddenException("You are not authorized");
    }
    const attendanceData = data;
    await this.prismaService.attendances.create({
      data: {
        id: generateID("ATT"),
        scheduleId: id,
        details: attendanceData,
      },
    });
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/setMaterial")
  async setMaterial(
    @Param("id") id: string,
    @Body() data: { material: string },
    @CurrentUser() currentUser: MyUserProfile
  ) {
    await this.prismaService.schedules.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
    if (!this.authorizationService.isCoachOfBranch(currentUser, id)) {
      throw new ForbiddenException("You are not authorized");
    }
    const { material } = data;
    if (!material.trim().startsWith("#")) {
      throw new BadRequestException("Material must be in markdown format");
    }
    await this.prismaService.schedules.update({
      where: {
        id: id,
      },
      data: {
        material: material,
      },
    });
    return true;
  }
}
