import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DelayEvent, DelayEventStatus } from './entities/delay-event.entity';
import { EOTClaim, EOTClientDecision } from './entities/eot-claim.entity';
import { LogDelayEventDto } from './dto/log-delay-event.dto';
import { PrepareEotClaimDto } from './dto/prepare-eot-claim.dto';

@Injectable()
export class EotDelayClaimsService {
    constructor(
        @InjectRepository(DelayEvent)
        private delayEventRepository: Repository<DelayEvent>,
        @InjectRepository(EOTClaim)
        private eotClaimRepository: Repository<EOTClaim>
    ) {}

    async logDelayEvent(dto: LogDelayEventDto): Promise<DelayEvent> {
        const event = this.delayEventRepository.create(dto);
        return this.delayEventRepository.save(event);
    }

    async issueNOD(eventId: string, nodRef: string): Promise<EOTClaim> {
        const claim = this.eotClaimRepository.create({ delayEventId: eventId, nodReference: nodRef, nodDate: new Date() });
        return this.eotClaimRepository.save(claim);
    }

    async collectEvidence(eventId: string, evidenceIds: string[]): Promise<void> {
        // Evidence collection logic
    }

    async prepareEOTClaim(eventId: string, claimData: PrepareEotClaimDto): Promise<EOTClaim> {
        return this.eotClaimRepository.save({ ...claimData, delayEventId: eventId });
    }

    async submitClaim(claimId: string): Promise<void> {
        await this.eotClaimRepository.update(claimId, { submissionDate: new Date() });
    }

    async recordClientDecision(claimId: string, decision: EOTClientDecision): Promise<void> {
        await this.eotClaimRepository.update(claimId, { clientDecision: decision, clientDecisionDate: new Date() });
    }

    async calculateDelayCost(claimId: string, costData: any): Promise<number> {
        return 0;
    }

    async checkLDApplicability(claimId: string, baselineId: string): Promise<boolean> {
        return false;
    }

    async getEventsByProject(projectId: string): Promise<DelayEvent[]> {
        return this.delayEventRepository.find({ where: { projectId } });
    }

    async getClaimsByProject(projectId: string): Promise<EOTClaim[]> {
        return this.eotClaimRepository.find({ where: { projectId } });
    }

    async getActiveEOT(projectId: string): Promise<EOTClaim | null> {
        return this.eotClaimRepository.findOne({ where: { projectId, clientDecision: EOTClientDecision.PENDING } });
    }

    async getEOTSummary(projectId: string): Promise<any> {
        return {};
    }
}
