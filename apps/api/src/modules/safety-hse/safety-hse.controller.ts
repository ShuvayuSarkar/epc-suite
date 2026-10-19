import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { SafetyHseService } from './safety-hse.service';
import { ReportIncidentDto } from './dto/report-incident.dto';
import { ScheduleAuditDto } from './dto/schedule-audit.dto';

@Controller('api/v1/safety')
export class SafetyHseController {
    constructor(private readonly safetyService: SafetyHseService) {}

    @Post('incidents')
    reportIncident(@Body() dto: ReportIncidentDto) {
        return this.safetyService.reportIncident(dto);
    }

    @Get('incidents/:projectId')
    getIncidents(@Param('projectId') projectId: string) {
        return this.safetyService.getIncidents(projectId);
    }

    @Patch('incidents/:id')
    updateIncident(@Param('id') id: string, @Body() data: any) {
        if (data.status === 'CLOSED') {
            return this.safetyService.closeIncident(id, data.actions);
        }
        return this.safetyService.investigateIncident(id, data.findings);
    }

    @Post('audits')
    scheduleAudit(@Body() dto: ScheduleAuditDto) {
        return this.safetyService.scheduleAudit(dto);
    }

    @Get('audits/:projectId')
    getAudits(@Param('projectId') projectId: string) {
        return [];
    }

    @Get('dashboard/:projectId')
    getSafetyDashboard(@Param('projectId') projectId: string) {
        return this.safetyService.getSafetyDashboard(projectId);
    }
}
