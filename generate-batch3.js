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
    // MODULE 6: EOT & Delay Claims
    'eot-delay-claims/entities/delay-event.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DelayEventType {
    JMC_DELAY = 'JMC_DELAY',
    UTILITY_CERT_DELAY = 'UTILITY_CERT_DELAY',
    SHUTDOWN = 'SHUTDOWN',
    ROW = 'ROW',
    APPROVAL_DELAY = 'APPROVAL_DELAY',
    FORCE_MAJEURE = 'FORCE_MAJEURE',
    DELIVERABLE_DELAY = 'DELIVERABLE_DELAY',
    SURVEY_BOQ_DELAY = 'SURVEY_BOQ_DELAY'
}

export enum DelayEventSource {
    STAGE_3 = 'STAGE_3',
    STAGE_5 = 'STAGE_5'
}

export enum DelayEventStatus {
    LOGGED = 'LOGGED',
    NOD_ISSUED = 'NOD_ISSUED',
    EVIDENCE_COLLECTED = 'EVIDENCE_COLLECTED',
    CLAIM_PREPARED = 'CLAIM_PREPARED',
    SUBMITTED = 'SUBMITTED',
    RESOLVED = 'RESOLVED',
    DISPUTED = 'DISPUTED'
}

@Entity('delay_events')
export class DelayEvent {
    @PrimaryGeneratedColumn('uuid')
    eventId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'enum', enum: DelayEventType })
    eventType: DelayEventType;

    @Column({ type: 'enum', enum: DelayEventSource })
    source: DelayEventSource;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'date' })
    eventDate: Date;

    @Column({ type: 'varchar' })
    loggedBy: string;

    @Column({ type: 'enum', enum: DelayEventStatus, default: DelayEventStatus.LOGGED })
    status: DelayEventStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
`,
    'eot-delay-claims/entities/eot-claim.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EOTClientDecision {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@Entity('eot_claims')
export class EOTClaim {
    @PrimaryGeneratedColumn('uuid')
    claimId: string;

    @Column({ type: 'uuid' })
    delayEventId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'varchar', nullable: true })
    nodReference: string | null;

    @Column({ type: 'date', nullable: true })
    nodDate: Date | null;

    @Column({ type: 'varchar', nullable: true })
    claimReference: string | null;

    @Column({ type: 'text', nullable: true })
    executiveSummary: string | null;

    @Column({ type: 'text', nullable: true })
    contractualClauses: string | null;

    @Column({ type: 'int', nullable: true })
    timeImpactDays: number | null;

    @Column({ type: 'date', nullable: true })
    submissionDate: Date | null;

    @Column({ type: 'enum', enum: EOTClientDecision, nullable: true })
    clientDecision: EOTClientDecision | null;

    @Column({ type: 'date', nullable: true })
    clientDecisionDate: Date | null;

    @Column({ type: 'decimal', nullable: true })
    delayCostAmount: number | null;

    @Column({ type: 'boolean', nullable: true })
    ldApplicable: boolean | null;

    @Column({ type: 'varchar', nullable: true })
    poAmendmentRef: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
`,
    'eot-delay-claims/dto/log-delay-event.dto.ts': `
import { IsUUID, IsEnum, IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { DelayEventType, DelayEventSource } from '../entities/delay-event.entity';

export class LogDelayEventDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsEnum(DelayEventType)
    @IsNotEmpty()
    eventType: DelayEventType;

    @IsEnum(DelayEventSource)
    @IsNotEmpty()
    source: DelayEventSource;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsDateString()
    @IsNotEmpty()
    eventDate: string;

    @IsString()
    @IsNotEmpty()
    loggedBy: string;
}
`,
    'eot-delay-claims/dto/prepare-eot-claim.dto.ts': `
import { IsString, IsOptional, IsInt, IsUUID } from 'class-validator';

export class PrepareEotClaimDto {
    @IsUUID()
    delayEventId: string;

    @IsUUID()
    projectId: string;

    @IsString()
    @IsOptional()
    executiveSummary?: string;

    @IsString()
    @IsOptional()
    contractualClauses?: string;

    @IsInt()
    @IsOptional()
    timeImpactDays?: number;
}
`,
    'eot-delay-claims/eot-delay-claims.module.ts': `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EotDelayClaimsService } from './eot-delay-claims.service';
import { EotDelayClaimsController } from './eot-delay-claims.controller';
import { DelayEvent } from './entities/delay-event.entity';
import { EOTClaim } from './entities/eot-claim.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DelayEvent, EOTClaim])],
    providers: [EotDelayClaimsService],
    controllers: [EotDelayClaimsController],
    exports: [EotDelayClaimsService]
})
export class EotDelayClaimsModule {}
`,
    'eot-delay-claims/eot-delay-claims.service.ts': `
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
`,
    'eot-delay-claims/eot-delay-claims.controller.ts': `
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
`,

    // MODULE 7: Safety & HSE
    'safety-hse/entities/safety-incident.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum SafetyIncidentSeverity {
    MINOR = 'MINOR',
    MAJOR = 'MAJOR',
    CRITICAL = 'CRITICAL',
    FATAL = 'FATAL'
}

export enum SafetyInvestigationStatus {
    REPORTED = 'REPORTED',
    INVESTIGATING = 'INVESTIGATING',
    CLOSED = 'CLOSED'
}

@Entity('safety_incidents')
export class SafetyIncident {
    @PrimaryGeneratedColumn('uuid')
    incidentId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'varchar' })
    incidentType: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'varchar' })
    location: string;

    @Column({ type: 'decimal', nullable: true })
    gpsLat: number | null;

    @Column({ type: 'decimal', nullable: true })
    gpsLon: number | null;

    @Column({ type: 'enum', enum: SafetyIncidentSeverity })
    severity: SafetyIncidentSeverity;

    @Column({ type: 'varchar' })
    reportedBy: string;

    @Column({ type: 'date' })
    reportedDate: Date;

    @Column({ type: 'enum', enum: SafetyInvestigationStatus, default: SafetyInvestigationStatus.REPORTED })
    investigationStatus: SafetyInvestigationStatus;

    @Column({ type: 'text', nullable: true })
    investigationFindings: string | null;

    @Column({ type: 'text', nullable: true })
    correctiveActions: string | null;

    @Column({ type: 'date', nullable: true })
    closedDate: Date | null;

    @CreateDateColumn()
    createdAt: Date;
}
`,
    'safety-hse/entities/safety-audit.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum SafetyAuditStatus {
    SCHEDULED = 'SCHEDULED',
    COMPLETED = 'COMPLETED',
    CORRECTIVE_ACTIONS = 'CORRECTIVE_ACTIONS'
}

@Entity('safety_audits')
export class SafetyAudit {
    @PrimaryGeneratedColumn('uuid')
    auditId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'varchar' })
    auditType: string;

    @Column({ type: 'date' })
    auditDate: Date;

    @Column({ type: 'varchar' })
    auditorName: string;

    @Column({ type: 'text' })
    findings: string;

    @Column({ type: 'int', nullable: true })
    score: number | null;

    @Column({ type: 'enum', enum: SafetyAuditStatus, default: SafetyAuditStatus.SCHEDULED })
    status: SafetyAuditStatus;

    @Column({ type: 'date', nullable: true })
    nextAuditDate: Date | null;

    @CreateDateColumn()
    createdAt: Date;
}
`,
    'safety-hse/dto/report-incident.dto.ts': `
import { IsUUID, IsEnum, IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { SafetyIncidentSeverity } from '../entities/safety-incident.entity';

export class ReportIncidentDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsString()
    @IsNotEmpty()
    incidentType: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsNumber()
    @IsOptional()
    gpsLat?: number;

    @IsNumber()
    @IsOptional()
    gpsLon?: number;

    @IsEnum(SafetyIncidentSeverity)
    @IsNotEmpty()
    severity: SafetyIncidentSeverity;

    @IsString()
    @IsNotEmpty()
    reportedBy: string;
}
`,
    'safety-hse/dto/schedule-audit.dto.ts': `
import { IsUUID, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class ScheduleAuditDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsString()
    @IsNotEmpty()
    auditType: string;

    @IsDateString()
    @IsNotEmpty()
    auditDate: string;

    @IsString()
    @IsNotEmpty()
    auditorName: string;
}
`,
    'safety-hse/safety-hse.module.ts': `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SafetyHseService } from './safety-hse.service';
import { SafetyHseController } from './safety-hse.controller';
import { SafetyIncident } from './entities/safety-incident.entity';
import { SafetyAudit } from './entities/safety-audit.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SafetyIncident, SafetyAudit])],
    providers: [SafetyHseService],
    controllers: [SafetyHseController],
    exports: [SafetyHseService]
})
export class SafetyHseModule {}
`,
    'safety-hse/safety-hse.service.ts': `
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
`,
    'safety-hse/safety-hse.controller.ts': `
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
`,

    // MODULE 8: Resource Management
    'resource-management/entities/asset.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AssetStatus {
    AVAILABLE = 'AVAILABLE',
    IN_USE = 'IN_USE',
    MAINTENANCE = 'MAINTENANCE',
    RETIRED = 'RETIRED'
}

@Entity('assets')
export class Asset {
    @PrimaryGeneratedColumn('uuid')
    assetId: string;

    @Column({ type: 'varchar' })
    assetName: string;

    @Column({ type: 'varchar' })
    assetType: string;

    @Column({ type: 'varchar', nullable: true })
    serialNumber: string | null;

    @Column({ type: 'varchar' })
    currentLocation: string;

    @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.AVAILABLE })
    status: AssetStatus;

    @Column({ type: 'uuid', nullable: true })
    assignedToProjectId: string | null;

    @Column({ type: 'uuid', nullable: true })
    assignedToGangId: string | null;

    @Column({ type: 'date', nullable: true })
    insuranceExpiryDate: Date | null;

    @Column({ type: 'date', nullable: true })
    calibrationExpiryDate: Date | null;

    @Column({ type: 'decimal', nullable: true })
    depreciationValue: number | null;

    @Column({ type: 'decimal', nullable: true })
    rentalRate: number | null;

    @Column({ type: 'boolean', default: false })
    isRented: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
`,
    'resource-management/dto/register-asset.dto.ts': `
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class RegisterAssetDto {
    @IsString()
    @IsNotEmpty()
    assetName: string;

    @IsString()
    @IsNotEmpty()
    assetType: string;

    @IsString()
    @IsOptional()
    serialNumber?: string;

    @IsString()
    @IsNotEmpty()
    currentLocation: string;

    @IsBoolean()
    isRented: boolean;

    @IsNumber()
    @IsOptional()
    rentalRate?: number;
}
`,
    'resource-management/dto/assign-asset.dto.ts': `
import { IsUUID, IsOptional } from 'class-validator';

export class AssignAssetDto {
    @IsUUID()
    @IsOptional()
    projectId?: string;

    @IsUUID()
    @IsOptional()
    gangId?: string;
}
`,
    'resource-management/resource-management.module.ts': `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceManagementService } from './resource-management.service';
import { ResourceManagementController } from './resource-management.controller';
import { Asset } from './entities/asset.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Asset])],
    providers: [ResourceManagementService],
    controllers: [ResourceManagementController],
    exports: [ResourceManagementService]
})
export class ResourceManagementModule {}
`,
    'resource-management/resource-management.service.ts': `
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset, AssetStatus } from './entities/asset.entity';
import { RegisterAssetDto } from './dto/register-asset.dto';

@Injectable()
export class ResourceManagementService {
    constructor(
        @InjectRepository(Asset)
        private assetRepo: Repository<Asset>
    ) {}

    async registerAsset(dto: RegisterAssetDto): Promise<Asset> {
        const asset = this.assetRepo.create(dto);
        return this.assetRepo.save(asset);
    }

    async findAll(): Promise<Asset[]> {
        return this.assetRepo.find();
    }

    async findByProject(projectId: string): Promise<Asset[]> {
        return this.assetRepo.find({ where: { assignedToProjectId: projectId } });
    }

    async findByType(type: string): Promise<Asset[]> {
        return this.assetRepo.find({ where: { assetType: type } });
    }

    async assignToProject(assetId: string, projectId: string): Promise<void> {
        await this.assetRepo.update(assetId, { assignedToProjectId: projectId, status: AssetStatus.IN_USE });
    }

    async assignToGang(assetId: string, gangId: string): Promise<void> {
        await this.assetRepo.update(assetId, { assignedToGangId: gangId, status: AssetStatus.IN_USE });
    }

    async releaseAsset(assetId: string): Promise<void> {
        await this.assetRepo.update(assetId, { assignedToProjectId: null, assignedToGangId: null, status: AssetStatus.AVAILABLE });
    }

    async updateMaintenanceSchedule(assetId: string, data: any): Promise<void> {}
    async getInsuranceExpiryAlerts(): Promise<Asset[]> { return []; }
    async getCalibrationExpiryAlerts(): Promise<Asset[]> { return []; }
    async getUtilizationDashboard(): Promise<any> { return {}; }
}
`,
    'resource-management/resource-management.controller.ts': `
import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { ResourceManagementService } from './resource-management.service';
import { RegisterAssetDto } from './dto/register-asset.dto';
import { AssignAssetDto } from './dto/assign-asset.dto';

@Controller('api/v1/resources')
export class ResourceManagementController {
    constructor(private readonly resourceService: ResourceManagementService) {}

    @Post()
    registerAsset(@Body() dto: RegisterAssetDto) {
        return this.resourceService.registerAsset(dto);
    }

    @Get()
    findAll() {
        return this.resourceService.findAll();
    }

    @Patch(':id/assign')
    assignAsset(@Param('id') id: string, @Body() dto: AssignAssetDto) {
        if (dto.projectId) return this.resourceService.assignToProject(id, dto.projectId);
        if (dto.gangId) return this.resourceService.assignToGang(id, dto.gangId);
    }

    @Patch(':id/release')
    releaseAsset(@Param('id') id: string) {
        return this.resourceService.releaseAsset(id);
    }
}
`,

    // MODULE 9: HR & Payroll
    'hr-payroll/entities/employee.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EmploymentType {
    PERMANENT = 'PERMANENT',
    CONTRACT = 'CONTRACT',
    DAILY_WAGE = 'DAILY_WAGE'
}

export enum EmployeeStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    TERMINATED = 'TERMINATED'
}

@Entity('employees')
export class Employee {
    @PrimaryGeneratedColumn('uuid')
    employeeId: string;

    @Column({ type: 'varchar' })
    fullName: string;

    @Column({ type: 'varchar', unique: true })
    employeeCode: string;

    @Column({ type: 'varchar' })
    department: string;

    @Column({ type: 'varchar' })
    designation: string;

    @Column({ type: 'enum', enum: EmploymentType })
    employmentType: EmploymentType;

    @Column({ type: 'uuid', nullable: true })
    reportingTo: string | null;

    @Column({ type: 'simple-array', nullable: true })
    skillSet: string[] | null;

    @Column({ type: 'date' })
    joinDate: Date;

    @Column({ type: 'enum', enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
    status: EmployeeStatus;

    @Column({ type: 'decimal', nullable: true })
    monthlySalary: number | null;

    @Column({ type: 'varchar', nullable: true })
    bankAccountNumber: string | null;

    @Column({ type: 'varchar', nullable: true })
    pfNumber: string | null;

    @Column({ type: 'varchar', nullable: true })
    esiNumber: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
`,
    'hr-payroll/entities/attendance-record.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AttendanceType {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
    HALF_DAY = 'HALF_DAY',
    LEAVE = 'LEAVE'
}

export enum AttendanceSource {
    BIOMETRIC = 'BIOMETRIC',
    MANUAL = 'MANUAL',
    GPS = 'GPS'
}

@Entity('attendance_records')
export class AttendanceRecord {
    @PrimaryGeneratedColumn('uuid')
    attendanceId: string;

    @Column({ type: 'uuid' })
    employeeId: string;

    @Column({ type: 'uuid', nullable: true })
    projectId: string | null;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'timestamp', nullable: true })
    checkInTime: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    checkOutTime: Date | null;

    @Column({ type: 'decimal', nullable: true })
    gpsLat: number | null;

    @Column({ type: 'decimal', nullable: true })
    gpsLon: number | null;

    @Column({ type: 'boolean', default: false })
    isGeofenced: boolean;

    @Column({ type: 'enum', enum: AttendanceType })
    attendanceType: AttendanceType;

    @Column({ type: 'enum', enum: AttendanceSource })
    source: AttendanceSource;

    @CreateDateColumn()
    createdAt: Date;
}
`,
    'hr-payroll/dto/create-employee.dto.ts': `
import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional, IsArray } from 'class-validator';
import { EmploymentType } from '../entities/employee.entity';

export class CreateEmployeeDto {
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    employeeCode: string;

    @IsString()
    @IsNotEmpty()
    department: string;

    @IsString()
    @IsNotEmpty()
    designation: string;

    @IsEnum(EmploymentType)
    @IsNotEmpty()
    employmentType: EmploymentType;

    @IsDateString()
    @IsNotEmpty()
    joinDate: string;

    @IsArray()
    @IsOptional()
    skillSet?: string[];
}
`,
    'hr-payroll/dto/record-attendance.dto.ts': `
import { IsUUID, IsEnum, IsNotEmpty, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { AttendanceType, AttendanceSource } from '../entities/attendance-record.entity';

export class RecordAttendanceDto {
    @IsUUID()
    @IsNotEmpty()
    employeeId: string;

    @IsUUID()
    @IsOptional()
    projectId?: string;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsEnum(AttendanceType)
    @IsNotEmpty()
    attendanceType: AttendanceType;

    @IsEnum(AttendanceSource)
    @IsNotEmpty()
    source: AttendanceSource;

    @IsNumber()
    @IsOptional()
    gpsLat?: number;

    @IsNumber()
    @IsOptional()
    gpsLon?: number;
}
`,
    'hr-payroll/hr-payroll.module.ts': `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrPayrollService } from './hr-payroll.service';
import { HrPayrollController } from './hr-payroll.controller';
import { Employee } from './entities/employee.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Employee, AttendanceRecord])],
    providers: [HrPayrollService],
    controllers: [HrPayrollController],
    exports: [HrPayrollService]
})
export class HrPayrollModule {}
`,
    'hr-payroll/hr-payroll.service.ts': `
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { RecordAttendanceDto } from './dto/record-attendance.dto';

@Injectable()
export class HrPayrollService {
    constructor(
        @InjectRepository(Employee)
        private employeeRepo: Repository<Employee>,
        @InjectRepository(AttendanceRecord)
        private attendanceRepo: Repository<AttendanceRecord>
    ) {}

    async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
        const employee = this.employeeRepo.create(dto);
        return this.employeeRepo.save(employee);
    }

    async findAll(): Promise<Employee[]> {
        return this.employeeRepo.find();
    }

    async findById(employeeId: string): Promise<Employee | null> {
        return this.employeeRepo.findOne({ where: { employeeId } });
    }

    async updateEmployee(employeeId: string, data: any): Promise<void> {
        await this.employeeRepo.update(employeeId, data);
    }

    async recordAttendance(dto: RecordAttendanceDto): Promise<AttendanceRecord> {
        const record = this.attendanceRepo.create(dto);
        return this.attendanceRepo.save(record);
    }

    async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
        return this.attendanceRepo.find({ where: { date: new Date(date) } });
    }

    async getAttendanceByEmployee(employeeId: string): Promise<AttendanceRecord[]> {
        return this.attendanceRepo.find({ where: { employeeId } });
    }

    async getAttendanceByProject(projectId: string): Promise<AttendanceRecord[]> {
        return this.attendanceRepo.find({ where: { projectId } });
    }

    async getMonthlyPayrollSummary(): Promise<any> { return {}; }
    async getPFESICompliance(): Promise<any> { return {}; }
    async getSkillMatrix(): Promise<any> { return {}; }
    async getManpowerPlan(): Promise<any> { return {}; }
}
`,
    'hr-payroll/hr-payroll.controller.ts': `
import { Controller, Post, Body, Param, Patch, Get, Query } from '@nestjs/common';
import { HrPayrollService } from './hr-payroll.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { RecordAttendanceDto } from './dto/record-attendance.dto';

@Controller('api/v1/hr')
export class HrPayrollController {
    constructor(private readonly hrService: HrPayrollService) {}

    @Post('employees')
    createEmployee(@Body() dto: CreateEmployeeDto) {
        return this.hrService.createEmployee(dto);
    }

    @Get('employees')
    findAll() {
        return this.hrService.findAll();
    }

    @Get('employees/:id')
    findById(@Param('id') id: string) {
        return this.hrService.findById(id);
    }

    @Patch('employees/:id')
    updateEmployee(@Param('id') id: string, @Body() data: any) {
        return this.hrService.updateEmployee(id, data);
    }

    @Post('attendance')
    recordAttendance(@Body() dto: RecordAttendanceDto) {
        return this.hrService.recordAttendance(dto);
    }

    @Get('attendance')
    getAttendance(@Query('employeeId') employeeId?: string, @Query('projectId') projectId?: string, @Query('date') date?: string) {
        if (employeeId) return this.hrService.getAttendanceByEmployee(employeeId);
        if (projectId) return this.hrService.getAttendanceByProject(projectId);
        if (date) return this.hrService.getAttendanceByDate(date);
        return [];
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
