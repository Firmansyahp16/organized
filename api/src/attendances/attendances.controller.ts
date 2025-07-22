import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Attendances } from "@prisma/client";
import { JwtAuthGuard } from "../auth/auth.guard";
import { generateID } from "../libs/generateID";
import { PrismaService } from "../prisma/prisma.service";

@Controller("Attendances")
export class AttendancesController {
  constructor(private prismaService: PrismaService) {}

  // Basic CRUD

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() data: Partial<Attendances>) {
    return await this.prismaService.attendances.create({
      data: {
        ...data,
        id: generateID("ATT"),
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
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
    @Body() data: Partial<Attendances>
  ) {
    return await this.prismaService.attendances.update({
      where: {
        id: id,
      },
      data: data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async removeAttendance(@Param("id") id: string) {
    return await this.prismaService.attendances.delete({
      where: {
        id: id,
      },
    });
  }
}
