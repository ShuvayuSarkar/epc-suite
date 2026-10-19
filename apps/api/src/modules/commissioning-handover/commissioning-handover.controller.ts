import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { CommissioningHandoverService } from './commissioning-handover.service';
import { CompleteTcDto } from './dto/complete-tc.dto';
import { CreatePunchListItemDto } from './dto/create-punch-list-item.dto';
import { PunchListStatus } from './entities/punch-list-item.entity';

@Controller('api/v1/commissioning')
export class CommissioningHandoverController {
    constructor(private readonly service: CommissioningHandoverService) {}

    @Post('pre-commissioning/:projectId')
    startPreCommissioning(@Param('projectId') projectId: string, @Body('checklistData') checklistData: any) {
        return this.service.startPreCommissioning(projectId, checklistData);
    }

    @Post('tc-milestone')
    completeTCMilestone(@Body() dto: CompleteTcDto) {
        return this.service.completeTCMilestone(dto);
    }

    @Get('tc-status/:projectId')
    getTCStatus(@Param('projectId') projectId: string) {
        return this.service.getTCStatus(projectId);
    }

    @Post('punch-list')
    createPunchListItem(@Body() dto: CreatePunchListItemDto) {
        return this.service.createPunchListItem(dto);
    }

    @Patch('punch-list/:id')
    updatePunchListItem(@Param('id') id: string, @Body('status') status: PunchListStatus) {
        return this.service.updatePunchListItem(id, status);
    }

    @Get('punch-list-status/:projectId')
    getPunchListStatus(@Param('projectId') projectId: string) {
        return this.service.getPunchListStatus(projectId);
    }

    @Post('om-manual/:projectId')
    assembleOMManual(@Param('projectId') projectId: string) {
        return this.service.assembleOMManual(projectId);
    }

    @Post('handover/:projectId')
    issueHandoverCertificate(@Param('projectId') projectId: string, @Body('certRef') certRef: string, @Body('dlpStartDate') dlpStartDate: string) {
        return this.service.issueHandoverCertificate(projectId, certRef, new Date(dlpStartDate));
    }

    @Get('dlp-alerts/:projectId')
    checkDLPAlerts(@Param('projectId') projectId: string) {
        return this.service.checkDLPAlerts(projectId);
    }

    @Get('status/:projectId')
    getCompletionStatus(@Param('projectId') projectId: string) {
        return this.service.getCompletionStatus(projectId);
    }

    @Post('closeout/:projectId')
    closeout(@Param('projectId') projectId: string, @Body('lessonsLearned') lessonsLearned: string) {
        return this.service.closeout(projectId, lessonsLearned);
    }
}
