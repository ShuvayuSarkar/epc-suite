import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { EotDelayClaimsService } from './eot-delay-claims.service';
import { LogDelayEventDto } from './dto/log-delay-event.dto';
import { PrepareEotClaimDto } from './dto/prepare-eot-claim.dto';
import { EOTClientDecision } from './entities/eot-claim.entity';

@Controller('api/v1/eot')
export class EotDelayClaimsController {
    constructor(private readonly eotService: EotDelayClaimsService) {}

    @Post('events')
    logDelayEvent(@Body() dto: LogDelayEventDto) {
        return this.eotService.logDelayEvent(dto);
    }

    @Post('events/:id/nod')
    issueNOD(@Param('id') id: string, @Body('nodRef') nodRef: string) {
        return this.eotService.issueNOD(id, nodRef);
    }

    @Post('events/:id/evidence')
    collectEvidence(@Param('id') id: string, @Body('evidenceIds') evidenceIds: string[]) {
        return this.eotService.collectEvidence(id, evidenceIds);
    }

    @Post('claims')
    prepareEOTClaim(@Body() dto: PrepareEotClaimDto) {
        return this.eotService.prepareEOTClaim(dto.delayEventId, dto);
    }

    @Post('claims/:id/submit')
    submitClaim(@Param('id') id: string) {
        return this.eotService.submitClaim(id);
    }

    @Patch('claims/:id/decision')
    recordClientDecision(@Param('id') id: string, @Body('decision') decision: EOTClientDecision) {
        return this.eotService.recordClientDecision(id, decision);
    }

    @Get('events/:projectId')
    getEventsByProject(@Param('projectId') projectId: string) {
        return this.eotService.getEventsByProject(projectId);
    }

    @Get('claims/:projectId')
    getClaimsByProject(@Param('projectId') projectId: string) {
        return this.eotService.getClaimsByProject(projectId);
    }

    @Get('summary/:projectId')
    getEOTSummary(@Param('projectId') projectId: string) {
        return this.eotService.getEOTSummary(projectId);
    }
}
