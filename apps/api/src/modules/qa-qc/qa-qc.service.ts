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
