import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafetyIncident, SafetyInvestigationStatus } from './entities/safety-incident.entity';
import { SafetyAudit, SafetyAuditStatus } from './entities/safety-audit.entity';
import { ReportIncidentDto } from './dto/report-incident.dto';
import { ScheduleAuditDto } from './dto/schedule-audit.dto';

@Injectable()
export class SafetyHseService {
    constructor(
        @InjectRepository(SafetyIncident)
        private incidentRepo: Repository<SafetyIncident>,
        @InjectRepository(SafetyAudit)
        private auditRepo: Repository<SafetyAudit>
    ) {}

    async reportIncident(dto: ReportIncidentDto): Promise<SafetyIncident> {
        const incident = this.incidentRepo.create({ ...dto, reportedDate: new Date() });
        return this.incidentRepo.save(incident);
    }

    async getIncidents(projectId: string): Promise<SafetyIncident[]> {
        return this.incidentRepo.find({ where: { projectId } });
    }

    async investigateIncident(incidentId: string, findings: string): Promise<void> {
        await this.incidentRepo.update(incidentId, { investigationFindings: findings, investigationStatus: SafetyInvestigationStatus.INVESTIGATING });
    }

    async closeIncident(incidentId: string, actions: string): Promise<void> {
        await this.incidentRepo.update(incidentId, { 
            correctiveActions: actions, 
            investigationStatus: SafetyInvestigationStatus.CLOSED,
            closedDate: new Date() 
        });
    }

    async scheduleAudit(dto: ScheduleAuditDto): Promise<SafetyAudit> {
        const audit = this.auditRepo.create({ ...dto, findings: '' });
        return this.auditRepo.save(audit);
    }

    async completeAudit(auditId: string, findings: string, score: number): Promise<void> {
        await this.auditRepo.update(auditId, { findings, score, status: SafetyAuditStatus.COMPLETED });
    }

    async getToolboxTalkCompliance(projectId: string): Promise<any> {
        return {};
    }

    async getSafetyDashboard(projectId: string): Promise<any> {
        return {};
    }
}
