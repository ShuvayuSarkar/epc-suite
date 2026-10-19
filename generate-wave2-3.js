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
    // MODULE: 4.14 Procurement & Vendor Management
    'procurement/entities/vendor.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum VendorStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    BLACKLISTED = 'BLACKLISTED'
}

@Entity('vendors')
export class Vendor {
    @PrimaryGeneratedColumn('uuid')
    vendorId: string;

    @Column({ type: 'varchar' })
    vendorName: string;

    @Column({ type: 'varchar', unique: true })
    vendorCode: string;

    @Column({ type: 'varchar' })
    category: string;

    @Column({ type: 'varchar', nullable: true })
    contactPerson: string | null;

    @Column({ type: 'varchar', nullable: true })
    email: string | null;

    @Column({ type: 'varchar', nullable: true })
    phone: string | null;

    @Column({ type: 'text', nullable: true })
    address: string | null;

    @Column({ type: 'boolean', default: false })
    isEmpanelled: boolean;

    @Column({ type: 'simple-array', nullable: true })
    empanelledByClientIds: string[] | null;

    @Column({ type: 'decimal', nullable: true })
    qualityRating: number | null;

    @Column({ type: 'decimal', nullable: true })
    deliveryRating: number | null;

    @Column({ type: 'decimal', nullable: true })
    overallScore: number | null;

    @Column({ type: 'enum', enum: VendorStatus, default: VendorStatus.ACTIVE })
    status: VendorStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
`,
    'procurement/entities/procurement-order.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum POStatus {
    DRAFT = 'DRAFT',
    ISSUED = 'ISSUED',
    ACKNOWLEDGED = 'ACKNOWLEDGED',
    IN_PRODUCTION = 'IN_PRODUCTION',
    DISPATCHED = 'DISPATCHED',
    DELIVERED = 'DELIVERED',
    CLOSED = 'CLOSED'
}

export enum TechnicalApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@Entity('procurement_orders')
export class ProcurementOrder {
    @PrimaryGeneratedColumn('uuid')
    procurementOrderId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'uuid' })
    vendorId: string;

    @Column({ type: 'varchar', unique: true })
    poNumber: string;

    @Column({ type: 'varchar' })
    category: string;

    @Column({ type: 'date' })
    orderDate: Date;

    @Column({ type: 'date', nullable: true })
    deliveryDate: Date | null;

    @Column({ type: 'decimal' })
    totalValue: number;

    @Column({ type: 'enum', enum: POStatus, default: POStatus.DRAFT })
    status: POStatus;

    @Column({ type: 'enum', enum: TechnicalApprovalStatus, nullable: true })
    technicalApprovalStatus: TechnicalApprovalStatus | null;

    @Column({ type: 'date', nullable: true })
    technicalApprovalDate: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
`,
    'procurement/dto/register-vendor.dto.ts': `
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class RegisterVendorDto {
    @IsString()
    @IsNotEmpty()
    vendorName: string;

    @IsString()
    @IsNotEmpty()
    vendorCode: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsOptional()
    contactPerson?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsBoolean()
    @IsOptional()
    isEmpanelled?: boolean;
}
`,
    'procurement/dto/issue-po.dto.ts': `
import { IsUUID, IsString, IsNotEmpty, IsDateString, IsNumber } from 'class-validator';

export class IssuePoDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsUUID()
    @IsNotEmpty()
    vendorId: string;

    @IsString()
    @IsNotEmpty()
    poNumber: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsDateString()
    @IsNotEmpty()
    orderDate: string;

    @IsNumber()
    @IsNotEmpty()
    totalValue: number;
}
`,
    'procurement/dto/select-vendor.dto.ts': `
import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class SelectVendorDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsUUID()
    @IsNotEmpty()
    vendorId: string;
}
`,
    'procurement/procurement.module.ts': `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';
import { Vendor } from './entities/vendor.entity';
import { ProcurementOrder } from './entities/procurement-order.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Vendor, ProcurementOrder])],
    providers: [ProcurementService],
    controllers: [ProcurementController],
    exports: [ProcurementService]
})
export class ProcurementModule {}
`,
    'procurement/procurement.service.ts': `
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { ProcurementOrder, POStatus } from './entities/procurement-order.entity';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { IssuePoDto } from './dto/issue-po.dto';

@Injectable()
export class ProcurementService {
    constructor(
        @InjectRepository(Vendor)
        private vendorRepo: Repository<Vendor>,
        @InjectRepository(ProcurementOrder)
        private poRepo: Repository<ProcurementOrder>
    ) {}

    async registerVendor(dto: RegisterVendorDto): Promise<Vendor> {
        const vendor = this.vendorRepo.create(dto);
        return this.vendorRepo.save(vendor);
    }

    async selectVendorForCategory(projectId: string, category: string, vendorId: string): Promise<any> {
        return { projectId, category, vendorId };
    }

    async issuePO(dto: IssuePoDto): Promise<ProcurementOrder> {
        const po = this.poRepo.create({ ...dto, status: POStatus.ISSUED });
        return this.poRepo.save(po);
    }

    async acknowledgePO(poId: string): Promise<void> {
        await this.poRepo.update(poId, { status: POStatus.ACKNOWLEDGED });
    }

    async updatePOStatus(poId: string, status: POStatus): Promise<void> {
        await this.poRepo.update(poId, { status });
    }

    async getVendorsByCategory(category: string): Promise<Vendor[]> {
        return this.vendorRepo.find({ where: { category } });
    }

    async getVendorScorecard(vendorId: string): Promise<any> {
        const vendor = await this.vendorRepo.findOne({ where: { vendorId } });
        return vendor ? { qualityRating: vendor.qualityRating, deliveryRating: vendor.deliveryRating, overallScore: vendor.overallScore } : null;
    }

    async evaluateVendor(vendorId: string, ratings: { quality: number; delivery: number }): Promise<void> {
        const overall = (ratings.quality + ratings.delivery) / 2;
        await this.vendorRepo.update(vendorId, { qualityRating: ratings.quality, deliveryRating: ratings.delivery, overallScore: overall });
    }

    async getProcurementDashboard(projectId: string): Promise<any> {
        return { message: 'Dashboard data' };
    }

    async getPerCategoryFinalizationStatus(projectId: string): Promise<any> {
        return { message: 'Category status data' };
    }

    async findPOsByProject(projectId: string): Promise<ProcurementOrder[]> {
        return this.poRepo.find({ where: { projectId } });
    }

    async getPOTracker(projectId: string): Promise<any> {
        return this.poRepo.find({ where: { projectId }, select: ['poNumber', 'deliveryDate', 'status'] });
    }
}
`,
    'procurement/procurement.controller.ts': `
import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { IssuePoDto } from './dto/issue-po.dto';
import { SelectVendorDto } from './dto/select-vendor.dto';
import { POStatus } from './entities/procurement-order.entity';

@Controller('api/v1/procurement')
export class ProcurementController {
    constructor(private readonly procurementService: ProcurementService) {}

    @Post('vendors')
    registerVendor(@Body() dto: RegisterVendorDto) {
        return this.procurementService.registerVendor(dto);
    }

    @Post('vendor-selection')
    selectVendorForCategory(@Body() dto: SelectVendorDto) {
        return this.procurementService.selectVendorForCategory(dto.projectId, dto.category, dto.vendorId);
    }

    @Post('purchase-orders')
    issuePO(@Body() dto: IssuePoDto) {
        return this.procurementService.issuePO(dto);
    }

    @Patch('purchase-orders/:id/status')
    updatePOStatus(@Param('id') id: string, @Body('status') status: POStatus) {
        if (status === POStatus.ACKNOWLEDGED) {
            return this.procurementService.acknowledgePO(id);
        }
        return this.procurementService.updatePOStatus(id, status);
    }

    @Get('vendors/by-category/:category')
    getVendorsByCategory(@Param('category') category: string) {
        return this.procurementService.getVendorsByCategory(category);
    }

    @Get('vendor-scorecard/:vendorId')
    getVendorScorecard(@Param('vendorId') vendorId: string) {
        return this.procurementService.getVendorScorecard(vendorId);
    }

    @Get('dashboard/:projectId')
    getProcurementDashboard(@Param('projectId') projectId: string) {
        return this.procurementService.getProcurementDashboard(projectId);
    }

    @Get('category-status/:projectId')
    getPerCategoryFinalizationStatus(@Param('projectId') projectId: string) {
        return this.procurementService.getPerCategoryFinalizationStatus(projectId);
    }

    @Get('po-tracker/:projectId')
    getPOTracker(@Param('projectId') projectId: string) {
        return this.procurementService.getPOTracker(projectId);
    }
}
`,

    // MODULE: 4.13 QA/QC
    'qa-qc/entities/inspection.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum InspectionType {
    FACTORY = 'FACTORY',
    TPIA = 'TPIA',
    FAT = 'FAT',
    SITE = 'SITE',
    PRE_COMMISSIONING = 'PRE_COMMISSIONING'
}

export enum InspectionResult {
    PASS = 'PASS',
    FAIL = 'FAIL',
    CONDITIONAL = 'CONDITIONAL'
}

export enum InspectionStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

@Entity('inspections')
export class Inspection {
    @PrimaryGeneratedColumn('uuid')
    inspectionId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'enum', enum: InspectionType })
    inspectionType: InspectionType;

    @Column({ type: 'varchar', nullable: true })
    category: string | null;

    @Column({ type: 'date' })
    scheduledDate: Date;

    @Column({ type: 'date', nullable: true })
    actualDate: Date | null;

    @Column({ type: 'varchar', nullable: true })
    inspectorName: string | null;

    @Column({ type: 'enum', enum: InspectionResult, nullable: true })
    result: InspectionResult | null;

    @Column({ type: 'text', nullable: true })
    findings: string | null;

    @Column({ type: 'enum', enum: InspectionStatus, default: InspectionStatus.SCHEDULED })
    status: InspectionStatus;

    @Column({ type: 'uuid', nullable: true })
    procurementOrderId: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
`,
    'qa-qc/entities/ncr.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum NcrSeverity {
    MINOR = 'MINOR',
    MAJOR = 'MAJOR',
    CRITICAL = 'CRITICAL'
}

export enum NcrStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    CLOSED = 'CLOSED'
}

@Entity('ncrs')
export class NCR {
    @PrimaryGeneratedColumn('uuid')
    ncrId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'uuid', nullable: true })
    inspectionId: string | null;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'enum', enum: NcrSeverity })
    severity: NcrSeverity;

    @Column({ type: 'text', nullable: true })
    rootCause: string | null;

    @Column({ type: 'text', nullable: true })
    correctiveAction: string | null;

    @Column({ type: 'varchar', nullable: true })
    responsibleParty: string | null;

    @Column({ type: 'date', nullable: true })
    targetDate: Date | null;

    @Column({ type: 'date', nullable: true })
    closedDate: Date | null;

    @Column({ type: 'enum', enum: NcrStatus, default: NcrStatus.OPEN })
    status: NcrStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
`,
    'qa-qc/dto/schedule-inspection.dto.ts': `
import { IsUUID, IsEnum, IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { InspectionType } from '../entities/inspection.entity';

export class ScheduleInspectionDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsEnum(InspectionType)
    @IsNotEmpty()
    inspectionType: InspectionType;

    @IsDateString()
    @IsNotEmpty()
    scheduledDate: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsUUID()
    @IsOptional()
    procurementOrderId?: string;
}
`,
    'qa-qc/dto/raise-ncr.dto.ts': `
import { IsUUID, IsEnum, IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { NcrSeverity } from '../entities/ncr.entity';

export class RaiseNcrDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsUUID()
    @IsOptional()
    inspectionId?: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(NcrSeverity)
    @IsNotEmpty()
    severity: NcrSeverity;

    @IsString()
    @IsOptional()
    responsibleParty?: string;

    @IsDateString()
    @IsOptional()
    targetDate?: string;
}
`,
    'qa-qc/qa-qc.module.ts': `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QaQcService } from './qa-qc.service';
import { QaQcController } from './qa-qc.controller';
import { Inspection } from './entities/inspection.entity';
import { NCR } from './entities/ncr.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Inspection, NCR])],
    providers: [QaQcService],
    controllers: [QaQcController],
    exports: [QaQcService]
})
export class QaQcModule {}
`,
    'qa-qc/qa-qc.service.ts': `
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inspection, InspectionStatus, InspectionResult } from './entities/inspection.entity';
import { NCR, NcrStatus } from './entities/ncr.entity';
import { ScheduleInspectionDto } from './dto/schedule-inspection.dto';
import { RaiseNcrDto } from './dto/raise-ncr.dto';

@Injectable()
export class QaQcService {
    constructor(
        @InjectRepository(Inspection)
        private inspectionRepo: Repository<Inspection>,
        @InjectRepository(NCR)
        private ncrRepo: Repository<NCR>
    ) {}

    async scheduleInspection(dto: ScheduleInspectionDto): Promise<Inspection> {
        const inspection = this.inspectionRepo.create(dto);
        return this.inspectionRepo.save(inspection);
    }

    async completeInspection(inspectionId: string, result: InspectionResult, findings: string): Promise<void> {
        await this.inspectionRepo.update(inspectionId, {
            result,
            findings,
            status: InspectionStatus.COMPLETED,
            actualDate: new Date()
        });
    }

    async raiseNCR(dto: RaiseNcrDto): Promise<NCR> {
        const ncr = this.ncrRepo.create(dto);
        return this.ncrRepo.save(ncr);
    }

    async closeNCR(ncrId: string, closedDate: Date): Promise<void> {
        await this.ncrRepo.update(ncrId, { status: NcrStatus.CLOSED, closedDate });
    }

    async getInspectionsByProject(projectId: string): Promise<Inspection[]> {
        return this.inspectionRepo.find({ where: { projectId } });
    }

    async getNCRsByProject(projectId: string): Promise<NCR[]> {
        return this.ncrRepo.find({ where: { projectId } });
    }

    async getQualityDashboard(projectId: string): Promise<any> {
        return { message: 'Quality dashboard data' };
    }

    async getTypeTestRegister(projectId: string): Promise<any> {
        return { message: 'Type test register' };
    }

    async getOTDRTraceRegister(projectId: string): Promise<any> {
        return { message: 'OTDR trace register' };
    }
}
`,
    'qa-qc/qa-qc.controller.ts': `
import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { QaQcService } from './qa-qc.service';
import { ScheduleInspectionDto } from './dto/schedule-inspection.dto';
import { RaiseNcrDto } from './dto/raise-ncr.dto';
import { InspectionResult } from './entities/inspection.entity';

@Controller('api/v1/qa-qc')
export class QaQcController {
    constructor(private readonly qaQcService: QaQcService) {}

    @Post('inspections')
    scheduleInspection(@Body() dto: ScheduleInspectionDto) {
        return this.qaQcService.scheduleInspection(dto);
    }

    @Patch('inspections/:id/complete')
    completeInspection(@Param('id') id: string, @Body('result') result: InspectionResult, @Body('findings') findings: string) {
        return this.qaQcService.completeInspection(id, result, findings);
    }

    @Post('ncrs')
    raiseNCR(@Body() dto: RaiseNcrDto) {
        return this.qaQcService.raiseNCR(dto);
    }

    @Patch('ncrs/:id/close')
    closeNCR(@Param('id') id: string, @Body('closedDate') closedDate: string) {
        return this.qaQcService.closeNCR(id, new Date(closedDate));
    }

    @Get('inspections/:projectId')
    getInspectionsByProject(@Param('projectId') projectId: string) {
        return this.qaQcService.getInspectionsByProject(projectId);
    }

    @Get('ncrs/:projectId')
    getNCRsByProject(@Param('projectId') projectId: string) {
        return this.qaQcService.getNCRsByProject(projectId);
    }

    @Get('dashboard/:projectId')
    getQualityDashboard(@Param('projectId') projectId: string) {
        return this.qaQcService.getQualityDashboard(projectId);
    }
}
`,

    // MODULE: 4.4 Hotspot Mapping
    'hotspot-mapping/entities/hotspot.entity.ts': `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum HotspotType {
    ROW = 'ROW',
    SHUTDOWN = 'SHUTDOWN',
    CROP = 'CROP',
    OLD_COMP = 'OLD_COMP',
    FOREST = 'FOREST',
    CLIENT = 'CLIENT',
    UTILITY = 'UTILITY'
}

export enum HotspotSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export enum HotspotStatus {
    IDENTIFIED = 'IDENTIFIED',
    ASSIGNED = 'ASSIGNED',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    ESCALATED = 'ESCALATED'
}

@Entity('hotspots')
export class Hotspot {
    @PrimaryGeneratedColumn('uuid')
    hotspotId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'uuid', nullable: true })
    lineSegmentId: string | null;

    @Column({ type: 'enum', enum: HotspotType })
    hotspotType: HotspotType;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'decimal' })
    gpsLat: number;

    @Column({ type: 'decimal' })
    gpsLon: number;

    @Column({ type: 'enum', enum: HotspotSeverity })
    severity: HotspotSeverity;

    @Column({ type: 'enum', enum: HotspotStatus, default: HotspotStatus.IDENTIFIED })
    status: HotspotStatus;

    @Column({ type: 'uuid', nullable: true })
    assignedSalesExecId: string | null;

    @Column({ type: 'varchar', nullable: true })
    assignedSalesExecName: string | null;

    @Column({ type: 'date' })
    identifiedDate: Date;

    @Column({ type: 'date', nullable: true })
    targetResolutionDate: Date | null;

    @Column({ type: 'date', nullable: true })
    actualResolutionDate: Date | null;

    @Column({ type: 'text', nullable: true })
    rootCause: string | null;

    @Column({ type: 'int', default: 0 })
    escalationLevel: number;

    @Column({ type: 'date', nullable: true })
    lastVisitDate: Date | null;

    @Column({ type: 'int', default: 0 })
    visitCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
`,
    'hotspot-mapping/dto/create-hotspot.dto.ts': `
import { IsUUID, IsEnum, IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { HotspotType, HotspotSeverity } from '../entities/hotspot.entity';

export class CreateHotspotDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsUUID()
    @IsOptional()
    lineSegmentId?: string;

    @IsEnum(HotspotType)
    @IsNotEmpty()
    hotspotType: HotspotType;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    gpsLat: number;

    @IsNumber()
    @IsNotEmpty()
    gpsLon: number;

    @IsEnum(HotspotSeverity)
    @IsNotEmpty()
    severity: HotspotSeverity;

    @IsDateString()
    @IsNotEmpty()
    identifiedDate: string;

    @IsDateString()
    @IsOptional()
    targetResolutionDate?: string;
}
`,
    'hotspot-mapping/dto/log-visit.dto.ts': `
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class LogVisitDto {
    @IsDateString()
    @IsNotEmpty()
    visitDate: string;

    @IsString()
    @IsNotEmpty()
    findings: string;
}
`,
    'hotspot-mapping/hotspot-mapping.module.ts': `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotspotMappingService } from './hotspot-mapping.service';
import { HotspotMappingController } from './hotspot-mapping.controller';
import { Hotspot } from './entities/hotspot.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Hotspot])],
    providers: [HotspotMappingService],
    controllers: [HotspotMappingController],
    exports: [HotspotMappingService]
})
export class HotspotMappingModule {}
`,
    'hotspot-mapping/hotspot-mapping.service.ts': `
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotspot, HotspotStatus, HotspotType } from './entities/hotspot.entity';
import { CreateHotspotDto } from './dto/create-hotspot.dto';

@Injectable()
export class HotspotMappingService {
    constructor(
        @InjectRepository(Hotspot)
        private hotspotRepo: Repository<Hotspot>
    ) {}

    async createHotspot(dto: CreateHotspotDto): Promise<Hotspot> {
        const hotspot = this.hotspotRepo.create(dto);
        return this.hotspotRepo.save(hotspot);
    }

    async assignSalesExec(hotspotId: string, execId: string, execName: string): Promise<void> {
        await this.hotspotRepo.update(hotspotId, {
            assignedSalesExecId: execId,
            assignedSalesExecName: execName,
            status: HotspotStatus.ASSIGNED
        });
    }

    async logVisit(hotspotId: string, visitDate: Date, findings: string): Promise<void> {
        const hotspot = await this.hotspotRepo.findOne({ where: { hotspotId } });
        if (hotspot) {
            hotspot.lastVisitDate = visitDate;
            hotspot.visitCount += 1;
            // Optionally log findings to a separate entity
            await this.hotspotRepo.save(hotspot);
        }
    }

    async updateStatus(hotspotId: string, status: HotspotStatus): Promise<void> {
        await this.hotspotRepo.update(hotspotId, { status });
    }

    async resolveHotspot(hotspotId: string, rootCause: string): Promise<void> {
        await this.hotspotRepo.update(hotspotId, {
            status: HotspotStatus.RESOLVED,
            rootCause,
            actualResolutionDate: new Date()
        });
    }

    async escalateHotspot(hotspotId: string): Promise<void> {
        const hotspot = await this.hotspotRepo.findOne({ where: { hotspotId } });
        if (hotspot) {
            hotspot.escalationLevel += 1;
            hotspot.status = HotspotStatus.ESCALATED;
            await this.hotspotRepo.save(hotspot);
        }
    }

    async getHotspotsByProject(projectId: string): Promise<Hotspot[]> {
        return this.hotspotRepo.find({ where: { projectId } });
    }

    async getHotspotsByType(projectId: string, type: HotspotType): Promise<Hotspot[]> {
        return this.hotspotRepo.find({ where: { projectId, hotspotType: type } });
    }

    async getHotspotDashboard(projectId: string): Promise<any> {
        return { message: 'Dashboard metrics' };
    }

    async getHeatMapData(projectId: string): Promise<any[]> {
        return this.hotspotRepo.find({ 
            where: { projectId },
            select: ['hotspotId', 'gpsLat', 'gpsLon', 'severity', 'hotspotType']
        });
    }

    async getResolutionTimeline(projectId: string): Promise<any> {
        return { message: 'Resolution timeline' };
    }

    async getOverdueHotspots(projectId: string): Promise<Hotspot[]> {
        // Need to calculate current date vs targetResolutionDate
        return [];
    }
}
`,
    'hotspot-mapping/hotspot-mapping.controller.ts': `
import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { HotspotMappingService } from './hotspot-mapping.service';
import { CreateHotspotDto } from './dto/create-hotspot.dto';
import { LogVisitDto } from './dto/log-visit.dto';
import { HotspotStatus, HotspotType } from './entities/hotspot.entity';

@Controller('api/v1/hotspots')
export class HotspotMappingController {
    constructor(private readonly hotspotService: HotspotMappingService) {}

    @Post()
    createHotspot(@Body() dto: CreateHotspotDto) {
        return this.hotspotService.createHotspot(dto);
    }

    @Patch(':id/assign')
    assignSalesExec(@Param('id') id: string, @Body('execId') execId: string, @Body('execName') execName: string) {
        return this.hotspotService.assignSalesExec(id, execId, execName);
    }

    @Post(':id/visit')
    logVisit(@Param('id') id: string, @Body() dto: LogVisitDto) {
        return this.hotspotService.logVisit(id, new Date(dto.visitDate), dto.findings);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: HotspotStatus) {
        return this.hotspotService.updateStatus(id, status);
    }

    @Patch(':id/resolve')
    resolveHotspot(@Param('id') id: string, @Body('rootCause') rootCause: string) {
        return this.hotspotService.resolveHotspot(id, rootCause);
    }

    @Patch(':id/escalate')
    escalateHotspot(@Param('id') id: string) {
        return this.hotspotService.escalateHotspot(id);
    }

    @Get('by-project/:projectId')
    getHotspotsByProject(@Param('projectId') projectId: string) {
        return this.hotspotService.getHotspotsByProject(projectId);
    }

    @Get('by-type/:projectId/:type')
    getHotspotsByType(@Param('projectId') projectId: string, @Param('type') type: HotspotType) {
        return this.hotspotService.getHotspotsByType(projectId, type);
    }

    @Get('dashboard/:projectId')
    getHotspotDashboard(@Param('projectId') projectId: string) {
        return this.hotspotService.getHotspotDashboard(projectId);
    }

    @Get('heatmap/:projectId')
    getHeatMapData(@Param('projectId') projectId: string) {
        return this.hotspotService.getHeatMapData(projectId);
    }

    @Get('overdue/:projectId')
    getOverdueHotspots(@Param('projectId') projectId: string) {
        return this.hotspotService.getOverdueHotspots(projectId);
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
