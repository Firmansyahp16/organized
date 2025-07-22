import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ExaminationsService {
  constructor(private prismaService: PrismaService) {}
  calculateResult(kihon: string, kata: string, kumite: string) {
    if (kihon === "a" && kata === "a" && kumite === "a") {
      return "special";
    }
    const failSet = new Set([
      "a,c,c",
      "b,c,c",
      "c,a,a",
      "c,a,b",
      "c,a,c",
      "c,b,a",
      "c,b,b",
      "c,b,c",
      "c,c,a",
      "c,c,b",
      "c,c,c",
    ]);
    const key = [kihon, kata, kumite].join(",");
    return failSet.has(key) ? "fail" : "pass";
  }

  async updateRank(userId: string, result: string) {
    const user = await this.prismaService.users.findUniqueOrThrow({
      where: { id: userId },
    });
    const userRank = user.rank ?? "";
    const current = parseInt(userRank.replace("kyu", ""), 10);
    let newRank = current;
    if (result === "pass" && current > 2) {
      newRank = current - 1;
    } else if (result === "special") {
      if (current > 3) {
        newRank = current - 2;
      } else if (current === 2) {
        newRank = current - 1;
      }
    }
    if (newRank !== current) {
      await this.prismaService.users.update({
        where: { id: userId },
        data: {
          rank: `kyu${newRank}`,
        },
      });
    }
  }
}
