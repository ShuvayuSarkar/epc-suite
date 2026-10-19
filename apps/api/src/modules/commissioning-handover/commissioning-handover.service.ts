import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommissioningMilestone, CommMilestoneStatus, CommMilestoneType } from './entities/commissioning-milestone.entity';
import { Handover, HandoverStatus } from './entities/handover.entity';
import { PunchListItem, PunchListStatus } from './entities/punch-list-item.entity';
import { CompleteTcDto } from './dto/complete-tc.dto';
import { CreatePunchListItemDto } from './dto/create-punch-list-item.dto';

@Injectable()
export class CommissioningHandoverService {
    constructor(
        @InjectRepository(CommissioningMilestone)
        private milestoneRepo: Repository<CommissioningMilestone>,
        @InjectRepository(Handover)
        private handoverRepo: Repository<Handover>,
        @InjectRepository(PunchListItem)
        private punchListRepo: Repository<PunchListItem>
    ) {}

    async startPreCommissioning(projectId: string, checklistData: any): Promise<CommissioningMilestone> {
        const milestone = this.milestoneRepo.create({
            projectId,
            milestoneType: CommMilestoneType.PRE_COMMISSIONING,
            status: CommMilestoneStatus.IN_PROGRESS,
            checklistData
        });
        return this.milestoneRepo.save(milestone);
    }

    async completeTCMilestone(dto: CompleteTcDto): Promise<void> {
        let milestone = await this.milestoneRepo.findOne({ where: { projectId: dto.projectId, milestoneType: dto.type } });
        if (!milestone) {
            milestone = this.milestoneRepo.create({ projectId: dto.projectId, milestoneType: dto.type });
        }
        milestone.status = CommMilestoneStatus.COMPLETED;
        milestone.completedDate = new Date();
        milestone.certificateRef = dto.certificateRef || null;
        milestone.signedBy = dto.signedBy || null;
        await this.milestoneRepo.save(milestone);
    }

    async getTCStatus(projectId: string): Promise<CommissioningMilestone[]> {
        return this.milestoneRepo.find({ where: { projectId } });
    }

    async createPunchListItem(dto: CreatePunchListItemDto): Promise<PunchListItem> {
        const item = this.punchListRepo.create(dto);
        return this.punchListRepo.save(item);
    }

    async updatePunchListItem(itemId: string, status: PunchListStatus): Promise<void> {
        await this.punchListRepo.update(itemId, { status });
    }

    async getPunchListStatus(projectId: string): Promise<any> {
        const items = await this.punchListRepo.find({ where: { projectId } });
        const openCount = items.filter(i => i.status === PunchListStatus.OPEN).length;
        const closedCount = items.filter(i => i.status === PunchListStatus.CLOSED).length;
        return { openCount, closedCount, totalCount: items.length };
    }

    async isPunchListClosed(projectId: string): Promise<boolean> {
        const count = await this.punchListRepo.count({ where: { projectId, status: PunchListStatus.OPEN } });
        return count === 0;
    }

    async assembleOMManual(projectId: string): Promise<void> {
        await this.handoverRepo.update({ projectId }, { omManualAssembled: true, omManualDate: new Date() });
    }

    async issueHandoverCertificate(projectId: string, certRef: string, dlpStartDate: Date): Promise<void> {
        await this.handoverRepo.update({ projectId }, { 
            handoverCertificateRef: certRef, 
            handoverCertificateDate: new Date(), 
            dlpStartDate,
            status: HandoverStatus.HANDOVER
        });
    }

    async checkDLPAlerts(projectId: string): Promise<any> { return {}; }
    async getCompletionStatus(projectId: string): Promise<any> { return {}; }
    async closeout(projectId: string, lessonsLearned: string): Promise<void> {
        await this.handoverRepo.update({ projectId }, { lessonsLearned, status: HandoverStatus.CLOSED });
    }
}
