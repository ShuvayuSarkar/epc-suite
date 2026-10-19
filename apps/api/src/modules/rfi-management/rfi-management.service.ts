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
