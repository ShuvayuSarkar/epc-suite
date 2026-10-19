import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { ProjectMappingDprService } from './project-mapping-dpr.service';
import { UpdateApprovalDto } from './dto/update-approval.dto';

@Controller('api/v1/project-mapping')
export class ProjectMappingDprController {
    constructor(private readonly projectMappingDprService: ProjectMappingDprService) {}

    @Post('health-snapshot/:projectId')
    generateHealthSnapshot(@Param('projectId') projectId: string) {
        return this.projectMappingDprService.generateHealthSnapshot(projectId);
    }

    @Get('health/:projectId')
    getProjectHealthDashboard(@Param('projectId') projectId: string) {
        return this.projectMappingDprService.getProjectHealthDashboard(projectId);
    }

    @Get('approval-checklist/:projectId')
    getApprovalChecklist(@Param('projectId') projectId: string) {
        return this.projectMappingDprService.getApprovalChecklist(projectId);
    }

    @Patch('approval/:id')
    updateApprovalStatus(@Param('id') id: string, @Body() dto: UpdateApprovalDto) {
        return this.projectMappingDprService.updateApprovalStatus(id, dto);
    }

    @Get('delay-analysis/:projectId')
    getDelayAnalysis(@Param('projectId') projectId: string) {
        return this.projectMappingDprService.getDelayAnalysis(projectId);
    }

    @Get('segment-rollup/:projectId')
    getSegmentRollup(@Param('projectId') projectId: string) {
        return this.projectMappingDprService.getSegmentRollup(projectId);
    }

    @Get('s-curve/:projectId')
    getSCurve(@Param('projectId') projectId: string) {
        return this.projectMappingDprService.getSCurve(projectId);
    }

    @Get('benchmarks/:projectId')
    getBenchmarkCompliance(@Param('projectId') projectId: string) {
        return this.projectMappingDprService.getBenchmarkCompliance(projectId);
    }
}
