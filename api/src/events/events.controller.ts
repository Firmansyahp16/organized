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
import { BranchService } from "../branch/branch.service";
import { CurrentUser } from "../common/decorators/current.decorator";
import { ExaminationsService } from "../examinations/examinations.service";
import { generateID } from "../libs/generateID";
import { PrismaService } from "../prisma/prisma.service";

@Controller("Events")
export class EventsController {
  constructor(
    private prismaService: PrismaService,
    private authorizationService: AuthorizationService,
    private branchService: BranchService,
    private examinationsService: ExaminationsService
  ) {}

  // Basic CRUD

  @UseGuards(JwtAuthGuard)
  @Post()
  async createEvent(@Body() data: Prisma.EventsCreateInput) {
    return await this.prismaService.events.create({
      data: {
        ...data,
        id: generateID("EVT"),
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getEvents() {
    return await this.prismaService.events.findMany();
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getEvent(@Param("id") id: string) {
    return await this.prismaService.events.findUniqueOrThrow({
      where: { id: id },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async updateEvent(
    @Param("id") id: string,
    @Body() data: Prisma.EventsUpdateInput
  ) {
    return await this.prismaService.events.update({
      where: {
        id: id,
      },
      data: data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async removeEvent(@Param("id") id: string) {
    return await this.prismaService.events.delete({
      where: {
        id: id,
      },
    });
  }

  // Custom Endpoints

  @UseGuards(JwtAuthGuard)
  @Get(":id/branchParticipated")
  async getBranchParticipated(@Param("id") id: string) {
    const result: {
      [branchId: string]: {
        id: string;
        name: string;
        rank: string;
      }[];
    } = {};
    const event = await this.prismaService.events.findUniqueOrThrow({
      where: { id: id },
    });
    for (const branchId of event.branchIds) {
      const members = await this.branchService.findMembers(branchId);
      result[branchId] = members.map((m) => ({
        id: String(m.id),
        name: String(m.fullName),
        rank: String(m.rank),
      }));
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/setParticipants")
  async setParticipants(
    @Param("id") id: string,
    @Body()
    data: {
      participants?: string[];
      auto?: boolean;
    },
    @CurrentUser() currentUser: MyUserProfile
  ) {
    const event = await this.prismaService.events.findUniqueOrThrow({
      where: { id: id },
    });
    if (
      !this.authorizationService.isAdmin(currentUser) &&
      !this.authorizationService.isCoachOfBranch(currentUser, event.branchIds)
    ) {
      throw new ForbiddenException("You are not authorized");
    }
    const eventDate = new Date(event.date as Date);
    const { type, branchIds } = event;
    let finalParticipants: { id: string; rank: string }[] = [];
    if (type === "schedules") {
      if (data.auto) {
        for (const branchId of branchIds) {
          const members = await this.branchService.findMembers(branchId);
          finalParticipants = members.map((m) => ({
            id: String(m.id),
            rank: String(m.rank),
          }));
        }
      } else if (data.participants) {
        finalParticipants = (
          await this.prismaService.users.findMany({
            where: {
              id: {
                in: data.participants,
              },
            },
          })
        ).map((m) => ({
          id: String(m.id),
          rank: String(m.rank),
        }));
      }
    } else if (type === "examinations") {
      if (data.auto) {
        const allExams = await this.prismaService.examinations.findMany({
          where: {
            date: {
              lt: eventDate,
            },
          },
          orderBy: {
            date: "desc",
          },
        });
        const examinationByBranchAndMember = new Map<
          string,
          Map<string, any>
        >();
        for (const exam of allExams) {
          if (!exam.branchId || !exam.participants) {
            continue;
          }
          for (const participant of exam.participants) {
            if (!examinationByBranchAndMember.has(exam.branchId)) {
              examinationByBranchAndMember.set(exam.branchId, new Map());
            }
            const memberMap = examinationByBranchAndMember.get(exam.branchId);
            const existing = memberMap?.get(participant.id);
            if (
              !existing ||
              new Date(exam.date as Date) > new Date(existing.date)
            ) {
              memberMap?.set(participant.id, participant);
            }
          }
        }
        const branchProcessingPromises = branchIds.map(async (branchId) => {
          const members = await this.branchService.findMembers(branchId);
          const branchParticipants: { id: string; rank: string }[] = [];
          for (const member of members) {
            const lastExam = examinationByBranchAndMember
              .get(branchId)
              ?.get(member.id);
            if (!lastExam) {
              continue;
            }
            const schedules = await this.prismaService.schedules.findMany({
              where: {
                branchId: branchId,
                date: {
                  lt: eventDate,
                  gte: lastExam.date,
                },
              },
              include: {
                attendance: true,
              },
            });
            const totalSchedules = schedules.length;
            let attendedSchedules = 0;
            for (const schedule of schedules) {
              const attendance = schedule.attendance;
              if (attendance && attendance.details) {
                if (
                  attendance.details.some(
                    (d) => d.id === member.id && d.status === "present"
                  )
                ) {
                  attendedSchedules += 1;
                }
              }
            }
            const ratio =
              totalSchedules > 0 ? (attendedSchedules + 4) / totalSchedules : 0;
            if (ratio >= 0.8) {
              branchParticipants.push({
                id: String(member.id),
                rank: String(member.rank),
              });
            }
          }
          return branchParticipants;
        });
        const allBranchResults = await Promise.all(branchProcessingPromises);
        finalParticipants = allBranchResults.flat();
      } else if (data.participants) {
        finalParticipants = (
          await this.prismaService.users.findMany({
            where: {
              id: {
                in: data.participants,
              },
            },
          })
        ).map((m) => ({
          id: String(m.id),
          rank: String(m.rank),
        }));
      }
    }
    await this.prismaService.events.update({
      where: {
        id: id,
      },
      data: {
        participants: finalParticipants,
      },
    });
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/setExaminers")
  async setExaminers(
    @Param("id") id: string,
    @Body()
    data: {
      examiners: string[];
    },
    @CurrentUser() currentUser: MyUserProfile
  ) {
    const event = await this.prismaService.events.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
    if (
      !this.authorizationService.isAdmin(currentUser) &&
      !this.authorizationService.isCoachOfBranch(currentUser, event.branchIds)
    ) {
      throw new ForbiddenException("You are not authorized");
    }
    return await this.prismaService.events.update({
      where: {
        id: id,
      },
      data: {
        examiners: data.examiners,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/setResults")
  async setResults(
    @Param("id") id: string,
    @Body()
    data: {
      [userId: string]: {
        kihon: string;
        kata: string;
        kumite: string;
      };
    },
    @CurrentUser() currentUser: MyUserProfile
  ) {
    const event = await this.prismaService.events.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
    if (
      !this.authorizationService.isAdmin(currentUser) &&
      !this.authorizationService.isCoachOfBranch(currentUser, event.branchIds)
    ) {
      throw new ForbiddenException("You are not authorized");
    }
    if (event.type !== "examinations") {
      throw new BadRequestException("This event type does not support results");
    }
    const participants: string[] = (event.participants ?? []).map((p) => p.id);
    const results = event.results ?? {};
    for (const [userId, categories] of Object.entries(data)) {
      const { kihon, kata, kumite } = categories;
      const result = this.examinationsService.calculateResult(
        kihon,
        kata,
        kumite
      );
      results[userId] = result;
    }
    await this.prismaService.events.update({
      where: {
        id: id,
      },
      data: {
        results: results,
      },
    });
    const allHaveResult = participants.every((p) => results[p]);
    if (allHaveResult) {
      for (const pid of participants) {
        await this.examinationsService.updateRank(
          pid,
          String(results[pid]?.result)
        );
      }
    }
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/setAttendance")
  async setAttendance(
    @Param("id") id: string,
    @Body()
    data: { id: string; status: "present" | "absence" }[],
    @CurrentUser() currentUser: MyUserProfile
  ) {
    const event = await this.prismaService.events.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
    if (
      !this.authorizationService.isAdmin(currentUser) &&
      !this.authorizationService.isCoachOfBranch(currentUser, event.branchIds)
    ) {
      throw new ForbiddenException("You are not authorized");
    }
    if (event.type !== "schedules") {
      throw new BadRequestException(
        "This event type does not support attendance"
      );
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
}
