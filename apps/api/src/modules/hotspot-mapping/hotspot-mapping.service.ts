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
