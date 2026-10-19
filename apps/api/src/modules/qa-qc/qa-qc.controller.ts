import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { QaQcService } from './qa-qc.service';
import { ScheduleInspectionDto } from './dto/schedule-inspection.dto';
import { RaiseNcrDto } from './dto/raise-ncr.dto';
import { InspectionResult } from './entities/inspection.entity';

@Controller('api/v1/qa-qc')
export class QaQcController {
    constructor(private readonly qaQcService: QaQcService) {}

    @Post('inspections')
    scheduleInspection(@Body() dto: ScheduleInspectionDto) {
        return this.qaQcService.scheduleInspection(dto);
    }

    @Patch('inspections/:id/complete')
    completeInspection(@Param('id') id: string, @Body('result') result: InspectionResult, @Body('findings') findings: string) {
        return this.qaQcService.completeInspection(id, result, findings);
    }

    @Post('ncrs')
    raiseNCR(@Body() dto: RaiseNcrDto) {
        return this.qaQcService.raiseNCR(dto);
    }

    @Patch('ncrs/:id/close')
    closeNCR(@Param('id') id: string, @Body('closedDate') closedDate: string) {
        return this.qaQcService.closeNCR(id, new Date(closedDate));
    }

    @Get('inspections/:projectId')
    getInspectionsByProject(@Param('projectId') projectId: string) {
        return this.qaQcService.getInspectionsByProject(projectId);
    }

    @Get('ncrs/:projectId')
    getNCRsByProject(@Param('projectId') projectId: string) {
        return this.qaQcService.getNCRsByProject(projectId);
    }

    @Get('dashboard/:projectId')
    getQualityDashboard(@Param('projectId') projectId: string) {
        return this.qaQcService.getQualityDashboard(projectId);
    }
}
