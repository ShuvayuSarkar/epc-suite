import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectHealth, RAGStatus } from './entities/project-health.entity';
import { ApprovalChecklistItem, ApprovalStatus } from './entities/approval-checklist-item.entity';
import { UpdateApprovalDto } from './dto/update-approval.dto';

@Injectable()
export class ProjectMappingDprService {
    constructor(
        @InjectRepository(ProjectHealth)
        private healthRepo: Repository<ProjectHealth>,
        @InjectRepository(ApprovalChecklistItem)
        private checklistRepo: Repository<ApprovalChecklistItem>
    ) {}

    async generateHealthSnapshot(projectId: string): Promise<ProjectHealth> {
        const snapshot = this.healthRepo.create({
            projectId,
            snapshotDate: new Date(),
            overallRAGStatus: RAGStatus.GREEN,
            manufacturingRAG: RAGStatus.GREEN,
            procurementRAG: RAGStatus.GREEN,
            installationRAG: RAGStatus.GREEN,
            commissioningRAG: RAGStatus.GREEN,
            financeRAG: RAGStatus.GREEN
        });
        return this.healthRepo.save(snapshot);
    }

    async getProjectHealthDashboard(projectId: string): Promise<ProjectHealth[]> {
        return this.healthRepo.find({ where: { projectId }, order: { snapshotDate: 'DESC' } });
    }

    async getApprovalChecklist(projectId: string): Promise<ApprovalChecklistItem[]> {
        return this.checklistRepo.find({ where: { projectId } });
    }

    async updateApprovalStatus(checklistItemId: string, dto: UpdateApprovalDto): Promise<void> {
        await this.checklistRepo.update(checklistItemId, {
            status: dto.status,
            [dto.status === ApprovalStatus.APPROVED ? 'approvedDate' : 'submittedDate']: new Date(dto.date)
        });
    }

    async getDelayAnalysis(projectId: string): Promise<any> { return {}; }
    async getSegmentRollup(projectId: string): Promise<any> { return {}; }
    async getSCurve(projectId: string): Promise<any> { return {}; }
    async getMandatorySparesStatus(projectId: string): Promise<any> { return {}; }
    async getWeatherSummary(projectId: string, dateRange: any): Promise<any> { return {}; }
    async getRFIAging(projectId: string): Promise<any> { return {}; }
    async getBenchmarkCompliance(projectId: string): Promise<any> { return {}; }
}
