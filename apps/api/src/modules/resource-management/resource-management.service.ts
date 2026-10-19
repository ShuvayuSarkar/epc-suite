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
