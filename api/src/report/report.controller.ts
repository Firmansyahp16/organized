import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/auth.guard";
import { ReportService } from "./report.service";

@Controller("Report")
export class ReportController {
  constructor(private reportService: ReportService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async generateReport(
    @Body()
    body: {
      branchId?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    return this.reportService.generateReport(
      String(body.branchId),
      String(body.type),
      String(body.startDate),
      String(body.endDate)
    );
  }
}
