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
