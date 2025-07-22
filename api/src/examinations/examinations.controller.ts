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
import { Examinations } from "@prisma/client";
import { JwtAuthGuard } from "../auth/auth.guard";
import { MyUserProfile } from "../auth/auth.service";
import { AuthorizationService } from "../authorization/authorization.service";
import { BranchService } from "../branch/branch.service";
import { CurrentUser } from "../common/decorators/current.decorator";
import { generateID } from "../libs/generateID";
import { PrismaService } from "../prisma/prisma.service";
import { ExaminationsService } from "./examinations.service";

@Controller("Examinations")
export class ExaminationsController {
  constructor(
    private prismaService: PrismaService,
    private authorizationService: AuthorizationService,
    private branchService: BranchService,
    private examinationsService: ExaminationsService
  ) {}

  // Basic CRUD

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() data: Partial<Examinations>) {
    return await this.prismaService.examinations.create({
      data: {
        ...data,
        id: generateID("EXM"),
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllExaminations() {
    return await this.prismaService.examinations.findMany();
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getExamination(@Param("id") id: string) {
    return await this.prismaService.examinations.findUniqueOrThrow({
      where: { id: id },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async updateExamination(
    @Param("id") id: string,
    @Body() data: Partial<Examinations>
  ) {
    return await this.prismaService.examinations.update({
      where: {
        id: id,
      },
      data: data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async removeExamination(@Param("id") id: string) {
    return await this.prismaService.examinations.delete({
      where: {
        id: id,
      },
    });
  }

  // Custom Endpoints

  @UseGuards(JwtAuthGuard)
  @Get(":id/participants")
  async getExaminationParticipants(@Param("id") id: string) {
    const examination = await this.prismaService.examinations.findUniqueOrThrow(
      {
        where: { id: id },
      }
    );
    if (!examination) {
      throw new NotFoundException("Examination not found");
    }
    const participants = examination.participants ?? [];
    const result: { id: string; name: string; rank: string }[] = [];
    for (const participant of participants) {
      const user = await this.prismaService.users.findUniqueOrThrow({
        where: { id: participant.id },
      });
      result.push({
        id: String(user.id),
        name: String(user.fullName),
        rank: String(user.rank),
      });
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/setParticipants")
  async setParticipants(
    @Param("id") id: string,
    @Body()
    data: {
      auto: boolean;
      participants?: string[];
    },
    @CurrentUser() currentUser: MyUserProfile
  ) {
    if (!this.authorizationService.isCoachOfBranch(currentUser, id)) {
      throw new ForbiddenException("You are not authorized");
    }
    const { auto, participants } = data;
    const examination = await this.prismaService.examinations.findUniqueOrThrow(
      {
        where: { id: id },
      }
    );
    const examDate = new Date(examination.date as Date);
    const [branchMembers, allExams, allSchedules] = await Promise.all([
      this.branchService.findMembers(id),
      this.prismaService.examinations.findMany({
        where: {
          date: {
            lt: examDate,
          },
        },
        orderBy: {
          date: "desc",
        },
        select: {
          participants: true,
          date: true,
        },
      }),
      this.prismaService.schedules.findMany({
        where: {
          branchId: examination.branchId,
        },
        include: {
          attendance: true,
        },
      }),
    ]);
    const lastExamMap = new Map<string, Date>();
    for (const exam of allExams) {
      const examParticipants = (exam.participants ?? []) as {
        id: string;
        rank: string;
      }[];
      for (const p of examParticipants) {
        if (!lastExamMap.has(p.id)) {
          lastExamMap.set(p.id, new Date(exam.date ?? 0));
        }
      }
    }
    const attendanceMap = new Map<string, number>();
    const schedulesInRange = allSchedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.date ?? new Date());
      return scheduleDate <= examDate;
    });
    const totalSchedules = schedulesInRange.length;
    for (const schedule of schedulesInRange) {
      const scheduleDate = new Date(schedule.date ?? 0);
      const details = schedule.attendance?.details ?? [];
      for (const detail of details) {
        if (detail.status === "present") {
          const lastExamDate = lastExamMap.get(detail.id) ?? new Date(0);
          const dateInRange =
            scheduleDate >= lastExamDate && scheduleDate <= examDate;
          if (dateInRange) {
            attendanceMap.set(
              detail.id,
              (attendanceMap.get(detail.id) ?? 0) + 1
            );
          }
        }
      }
    }
    let finalParticipants: { id: string; rank: string }[] = [];
    if (auto) {
      const qualified = branchMembers.filter((member) => {
        const presentCount = attendanceMap.get(String(member.id)) ?? 0;
        const ratio = (presentCount + 4) / (totalSchedules + 4);
        return ratio >= 0.8;
      });
      finalParticipants = qualified.map((q) => ({
        id: String(q.id),
        rank: String(q.rank),
      }));
    } else if (participants) {
      const selected = branchMembers.filter((u) =>
        participants.includes(String(u.id))
      );
      finalParticipants = selected.map((m) => ({
        id: String(m.id),
        rank: String(m.rank),
      }));
    }
    await this.prismaService.examinations.update({
      where: { id: id },
      data: {
        participants: finalParticipants,
      },
    });
    return true;
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
    const examination = await this.prismaService.examinations.findUniqueOrThrow(
      {
        where: { id: id },
      }
    );
    if (!this.authorizationService.isExaminer(currentUser, examination)) {
      throw new ForbiddenException("You are not authorized");
    }
    const participants: string[] = (examination.participants ?? []).map(
      (p) => p.id
    );
    const results = examination.results ?? {};
    for (const [userId, categories] of Object.entries(data)) {
      const { kihon, kata, kumite } = categories;
      const result = this.examinationsService.calculateResult(
        kihon,
        kata,
        kumite
      );
      results[userId] = { kihon, kata, kumite, result };
    }
    await this.prismaService.examinations.update({
      where: { id: id },
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
}
