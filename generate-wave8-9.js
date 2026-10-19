const fs = require('fs');
const path = require('path');

const rootDir = 'd:\\OneDrive - Apar Industries Limited\\Documents\\EPC\\epc-suite';
const apiModulesPath = path.join(rootDir, 'apps/api/src/modules');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

const files = {
    // MODULE: 4.1 Project Mapping/DPR
    'project-mapping-dpr/entities/project-health.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum RAGStatus {
    RED = 'RED',
    AMBER = 'AMBER',
    GREEN = 'GREEN'
}

@Entity('project_health_snapshots')
export class ProjectHealth {
    @PrimaryGeneratedColumn('uuid')
    snapshotId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'date' })
    snapshotDate: Date;

    @Column({ type: 'enum', enum: RAGStatus })
    overallRAGStatus: RAGStatus;

    @Column({ type: 'enum', enum: RAGStatus })
    manufacturingRAG: RAGStatus;

    @Column({ type: 'enum', enum: RAGStatus })
    procurementRAG: RAGStatus;

    @Column({ type: 'enum', enum: RAGStatus })
    installationRAG: RAGStatus;

    @Column({ type: 'enum', enum: RAGStatus })
    commissioningRAG: RAGStatus;

    @Column({ type: 'enum', enum: RAGStatus })
    financeRAG: RAGStatus;

    @Column({ type: 'int', default: 0 })
    scheduleVarianceDays: number;

    @Column({ type: 'decimal', default: 0 })
    costVariancePercent: number;

    @Column({ type: 'int', default: 0 })
    approvalsPending: number;

    @Column({ type: 'int', default: 0 })
    rfisOpen: number;

    @Column({ type: 'int', default: 0 })
    hotspotsOpen: number;

    @Column({ type: 'text', nullable: true })
    remarks: string | null;

    @CreateDateColumn()
    createdAt: Date;
}
`,
    'project-mapping-dpr/entities/approval-checklist-item.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ApprovalStatus {
    PENDING = 'PENDING',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    OVERDUE = 'OVERDUE'
}

@Entity('approval_checklist_items')
export class ApprovalChecklistItem {
    @PrimaryGeneratedColumn('uuid')
    checklistItemId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'varchar' })
    approvalStep: string;

    @Column({ type: 'varchar', nullable: true })
    category: string | null;

    @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
    status: ApprovalStatus;

    @Column({ type: 'date', nullable: true })
    submittedDate: Date | null;

    @Column({ type: 'date', nullable: true })
    approvedDate: Date | null;

    @Column({ type: 'int' })
    slaDays: number;

    @Column({ type: 'int', default: 0 })
    daysElapsed: number;

    @Column({ type: 'boolean', default: false })
    isOverdue: boolean;

    @Column({ type: 'boolean', default: false })
    escalationTriggered: boolean;

    @Column({ type: 'boolean', default: false })
    clientSLA: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
`,
    'project-mapping-dpr/dto/update-approval.dto.ts': `
import { IsEnum, IsDateString, IsNotEmpty } from 'class-validator';
import { ApprovalStatus } from '../entities/approval-checklist-item.entity';

export class UpdateApprovalDto {
    @IsEnum(ApprovalStatus)
    @IsNotEmpty()
    status: ApprovalStatus;

    @IsDateString()
    @IsNotEmpty()
    date: string;
}
`,
    'project-mapping-dpr/project-mapping-dpr.module.ts': `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMappingDprService } from './project-mapping-dpr.service';
import { ProjectMappingDprController } from './project-mapping-dpr.controller';
import { ProjectHealth } from './entities/project-health.entity';
import { ApprovalChecklistItem } from './entities/approval-checklist-item.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ProjectHealth, ApprovalChecklistItem])],
    providers: [ProjectMappingDprService],
    controllers: [ProjectMappingDprController],
    exports: [ProjectMappingDprService]
})
export class ProjectMappingDprModule {}
`,
    'project-mapping-dpr/project-mapping-dpr.service.ts': `
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
`,
    'project-mapping-dpr/project-mapping-dpr.controller.ts': `
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
`,

    // MODULE: 4.20 Commissioning & Handover
    'commissioning-handover/entities/commissioning-milestone.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CommMilestoneType {
    PRE_COMMISSIONING = 'PRE_COMMISSIONING',
    LINE_TC = 'LINE_TC',
    SUBSTATION_TC = 'SUBSTATION_TC',
    OPGW_OFC_TC = 'OPGW_OFC_TC',
    CHARGING = 'CHARGING',
    TRIAL_RUN = 'TRIAL_RUN'
}

export enum CommMilestoneStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}

@Entity('commissioning_milestones')
export class CommissioningMilestone {
    @PrimaryGeneratedColumn('uuid')
    commMilestoneId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'enum', enum: CommMilestoneType })
    milestoneType: CommMilestoneType;

    @Column({ type: 'enum', enum: CommMilestoneStatus, default: CommMilestoneStatus.NOT_STARTED })
    status: CommMilestoneStatus;

    @Column({ type: 'jsonb', nullable: true })
    checklistData: any | null;

    @Column({ type: 'date', nullable: true })
    completedDate: Date | null;

    @Column({ type: 'varchar', nullable: true })
    certificateRef: string | null;

    @Column({ type: 'varchar', nullable: true })
    signedBy: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
`,
    'commissioning-handover/entities/handover.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum HandoverStatus {
    PRE_COMMISSIONING = 'PRE_COMMISSIONING',
    COMMISSIONING = 'COMMISSIONING',
    PUNCH_LIST = 'PUNCH_LIST',
    HANDOVER = 'HANDOVER',
    DLP_ACTIVE = 'DLP_ACTIVE',
    CLOSED = 'CLOSED'
}

@Entity('handovers')
export class Handover {
    @PrimaryGeneratedColumn('uuid')
    handoverId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'boolean', default: false })
    omManualAssembled: boolean;

    @Column({ type: 'date', nullable: true })
    omManualDate: Date | null;

    @Column({ type: 'varchar', nullable: true })
    handoverCertificateRef: string | null;

    @Column({ type: 'date', nullable: true })
    handoverCertificateDate: Date | null;

    @Column({ type: 'date', nullable: true })
    dlpStartDate: Date | null;

    @Column({ type: 'date', nullable: true })
    dlpEndDate: Date | null;

    @Column({ type: 'boolean', default: false })
    dlp30DayAlertSent: boolean;

    @Column({ type: 'boolean', default: false })
    dlp60DayAlertSent: boolean;

    @Column({ type: 'boolean', default: false })
    dlp90DayAlertSent: boolean;

    @Column({ type: 'varchar', nullable: true })
    completionCertificateRef: string | null;

    @Column({ type: 'text', nullable: true })
    lessonsLearned: string | null;

    @Column({ type: 'enum', enum: HandoverStatus, default: HandoverStatus.PRE_COMMISSIONING })
    status: HandoverStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
`,
    'commissioning-handover/entities/punch-list-item.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum PunchListSeverity { A = 'A', B = 'B', C = 'C' }
export enum PunchListStatus { OPEN = 'OPEN', CLOSED = 'CLOSED' }

@Entity('punch_list_items')
export class PunchListItem {
    @PrimaryGeneratedColumn('uuid')
    itemId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column('text')
    description: string;

    @Column({ type: 'enum', enum: PunchListSeverity })
    severity: PunchListSeverity;

    @Column({ type: 'enum', enum: PunchListStatus, default: PunchListStatus.OPEN })
    status: PunchListStatus;

    @Column({ type: 'simple-array', nullable: true })
    photos: string[] | null;

    @Column('decimal', { nullable: true })
    gpsLat: number | null;

    @Column('decimal', { nullable: true })
    gpsLon: number | null;

    @CreateDateColumn()
    createdAt: Date;
}
`,
    'commissioning-handover/dto/complete-tc.dto.ts': `
import { IsUUID, IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { CommMilestoneType } from '../entities/commissioning-milestone.entity';

export class CompleteTcDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsEnum(CommMilestoneType)
    @IsNotEmpty()
    type: CommMilestoneType;

    @IsString()
    @IsOptional()
    certificateRef?: string;

    @IsString()
    @IsOptional()
    signedBy?: string;
}
`,
    'commissioning-handover/dto/create-punch-list-item.dto.ts': `
import { IsUUID, IsEnum, IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';
import { PunchListSeverity } from '../entities/punch-list-item.entity';

export class CreatePunchListItemDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(PunchListSeverity)
    @IsNotEmpty()
    severity: PunchListSeverity;

    @IsArray()
    @IsOptional()
    photos?: string[];

    @IsNumber()
    @IsOptional()
    gpsLat?: number;

    @IsNumber()
    @IsOptional()
    gpsLon?: number;
}
`,
    'commissioning-handover/commissioning-handover.module.ts': `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommissioningHandoverService } from './commissioning-handover.service';
import { CommissioningHandoverController } from './commissioning-handover.controller';
import { CommissioningMilestone } from './entities/commissioning-milestone.entity';
import { Handover } from './entities/handover.entity';
import { PunchListItem } from './entities/punch-list-item.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CommissioningMilestone, Handover, PunchListItem])],
    providers: [CommissioningHandoverService],
    controllers: [CommissioningHandoverController],
    exports: [CommissioningHandoverService]
})
export class CommissioningHandoverModule {}
`,
    'commissioning-handover/commissioning-handover.service.ts': `
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
`,
    'commissioning-handover/commissioning-handover.controller.ts': `
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
`,

    // MODULE: 4.21 RFI Management
    'rfi-management/entities/rfi.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RfiStatus {
    OPEN = 'OPEN',
    ROUTED = 'ROUTED',
    RESPONDED = 'RESPONDED',
    CLOSED = 'CLOSED'
}

@Entity('rfis')
export class RFI {
    @PrimaryGeneratedColumn('uuid')
    rfiId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column()
    subject: string;

    @Column('text')
    description: string;

    @Column({ type: 'simple-array', nullable: true })
    attachments: string[] | null;

    @Column({ nullable: true })
    assignedTo: string | null;

    @Column({ type: 'enum', enum: RfiStatus, default: RfiStatus.OPEN })
    status: RfiStatus;

    @Column('text', { nullable: true })
    response: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
`,
    'rfi-management/dto/create-rfi.dto.ts': `
import { IsUUID, IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateRfiDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsArray()
    @IsOptional()
    attachments?: string[];
}
`,
    'rfi-management/dto/respond-rfi.dto.ts': `
import { IsString, IsNotEmpty } from 'class-validator';

export class RespondRfiDto {
    @IsString()
    @IsNotEmpty()
    response: string;
}
`,
    'rfi-management/rfi-management.module.ts': `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RfiManagementService } from './rfi-management.service';
import { RfiManagementController } from './rfi-management.controller';
import { RFI } from './entities/rfi.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RFI])],
    providers: [RfiManagementService],
    controllers: [RfiManagementController],
    exports: [RfiManagementService]
})
export class RfiManagementModule {}
`,
    'rfi-management/rfi-management.service.ts': `
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RFI, RfiStatus } from './entities/rfi.entity';
import { CreateRfiDto } from './dto/create-rfi.dto';

@Injectable()
export class RfiManagementService {
    constructor(
        @InjectRepository(RFI)
        private rfiRepo: Repository<RFI>
    ) {}

    async createRFI(dto: CreateRfiDto): Promise<RFI> {
        const rfi = this.rfiRepo.create(dto);
        return this.rfiRepo.save(rfi);
    }

    async routeRFI(rfiId: string, assignedTo: string): Promise<void> {
        await this.rfiRepo.update(rfiId, { assignedTo, status: RfiStatus.ROUTED });
    }

    async respondToRFI(rfiId: string, response: string): Promise<void> {
        await this.rfiRepo.update(rfiId, { response, status: RfiStatus.RESPONDED });
    }

    async closeRFI(rfiId: string): Promise<void> {
        await this.rfiRepo.update(rfiId, { status: RfiStatus.CLOSED });
    }

    async getRFIsByProject(projectId: string): Promise<RFI[]> {
        return this.rfiRepo.find({ where: { projectId } });
    }

    async getRFIsByStatus(projectId: string, status: RfiStatus): Promise<RFI[]> {
        return this.rfiRepo.find({ where: { projectId, status } });
    }

    async getRFIAgingReport(projectId: string): Promise<any> { return {}; }
    async getOverdueRFIs(projectId: string): Promise<RFI[]> { return []; }
    async getRFIRegister(projectId: string): Promise<any> { return {}; }
}
`,
    'rfi-management/rfi-management.controller.ts': `
import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { RfiManagementService } from './rfi-management.service';
import { CreateRfiDto } from './dto/create-rfi.dto';
import { RespondRfiDto } from './dto/respond-rfi.dto';
import { RfiStatus } from './entities/rfi.entity';

@Controller('api/v1/rfis')
export class RfiManagementController {
    constructor(private readonly service: RfiManagementService) {}

    @Post()
    createRFI(@Body() dto: CreateRfiDto) {
        return this.service.createRFI(dto);
    }

    @Patch(':id/route')
    routeRFI(@Param('id') id: string, @Body('assignedTo') assignedTo: string) {
        return this.service.routeRFI(id, assignedTo);
    }

    @Patch(':id/respond')
    respondToRFI(@Param('id') id: string, @Body() dto: RespondRfiDto) {
        return this.service.respondToRFI(id, dto.response);
    }

    @Patch(':id/close')
    closeRFI(@Param('id') id: string) {
        return this.service.closeRFI(id);
    }

    @Get('by-project/:projectId')
    getRFIsByProject(@Param('projectId') projectId: string) {
        return this.service.getRFIsByProject(projectId);
    }

    @Get('aging/:projectId')
    getRFIAgingReport(@Param('projectId') projectId: string) {
        return this.service.getRFIAgingReport(projectId);
    }

    @Get('overdue/:projectId')
    getOverdueRFIs(@Param('projectId') projectId: string) {
        return this.service.getOverdueRFIs(projectId);
    }

    @Get('register/:projectId')
    getRFIRegister(@Param('projectId') projectId: string) {
        return this.service.getRFIRegister(projectId);
    }
}
`
};

for (const [relPath, content] of Object.entries(files)) {
    const fullPath = path.join(apiModulesPath, relPath);
    ensureDir(path.dirname(fullPath));
    fs.writeFileSync(fullPath, content.trim() + '\\n');
    console.log('Created:', fullPath);
}
