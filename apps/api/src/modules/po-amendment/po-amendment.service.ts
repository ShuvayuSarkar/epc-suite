import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { POAmendment } from './entities/po-amendment.entity';
import { Project } from '../../database/entities/project.entity';
import { POLineItem } from '../../database/entities/po-line-item.entity';
import { RequestAmendmentDto } from './dto/request-amendment.dto';
import { ImpactAnalysisDto } from './dto/impact-analysis.dto';

@Injectable()
export class PoAmendmentService {
  constructor(
    @InjectRepository(POAmendment)
    private readonly poAmendmentRepo: Repository<POAmendment>,
  ) {}

  async requestAmendment(dto: RequestAmendmentDto): Promise<POAmendment> {
    const amd = this.poAmendmentRepo.create({
      ...dto,
      status: 'REQUESTED',
    });
    return this.poAmendmentRepo.save(amd);
  }

  async performImpactAnalysis(amendmentId: string, dto: ImpactAnalysisDto): Promise<POAmendment> {
    const amd = await this.poAmendmentRepo.findOne({ where: { amendmentId } });
    if (!amd) throw new NotFoundException('PO Amendment not found');

    amd.costImpact = dto.cost;
    amd.timeImpactDays = dto.timeDays;
    amd.scopeChange = dto.scope;
    amd.status = 'IMPACT_ANALYSIS';
    return this.poAmendmentRepo.save(amd);
  }

  async internalApproval(amendmentId: string, approverRole: string, approved: boolean): Promise<POAmendment> {
    const amd = await this.poAmendmentRepo.findOne({ where: { amendmentId } });
    if (!amd) throw new NotFoundException('PO Amendment not found');

    const approvers = amd.internalApprovers || [];
    approvers.push({ role: approverRole, approved, date: new Date() });
    amd.internalApprovers = approvers;

    // simplistic logic: if CFO or PD approves, mark internal approval done
    if (approved && (approverRole === 'CFO' || approverRole === 'PD' || approverRole === 'Legal')) {
      amd.status = 'INTERNAL_APPROVAL';
      amd.internalApprovalDate = new Date();
    }
    
    return this.poAmendmentRepo.save(amd);
  }

  async requestClientApproval(amendmentId: string): Promise<POAmendment> {
    const amd = await this.poAmendmentRepo.findOne({ where: { amendmentId } });
    if (!amd) throw new NotFoundException('PO Amendment not found');

    amd.clientApprovalRequired = true;
    amd.status = 'CLIENT_APPROVAL';
    return this.poAmendmentRepo.save(amd);
  }

  async recordClientApproval(amendmentId: string, approved: boolean): Promise<POAmendment> {
    const amd = await this.poAmendmentRepo.findOne({ where: { amendmentId } });
    if (!amd) throw new NotFoundException('PO Amendment not found');

    amd.clientApprovalDate = new Date();
    amd.status = approved ? 'APPROVED' : 'REQUESTED'; // fallback if rejected
    return this.poAmendmentRepo.save(amd);
  }

  async issueAmendedPO(amendmentId: string, amendedPONumber: string): Promise<POAmendment> {
    const amd = await this.poAmendmentRepo.findOne({ where: { amendmentId } });
    if (!amd) throw new NotFoundException('PO Amendment not found');

    amd.amendedPONumber = amendedPONumber;
    amd.status = 'ISSUED';
    return this.poAmendmentRepo.save(amd);
  }

  async implementAmendment(amendmentId: string): Promise<POAmendment> {
    const amd = await this.poAmendmentRepo.findOne({ where: { amendmentId } });
    if (!amd) throw new NotFoundException('PO Amendment not found');

    amd.status = 'IMPLEMENTED';
    if (amd.timeImpactDays > 0 || amd.costImpact > 0) {
      amd.baselineUpdateRequired = true;
    }
    return this.poAmendmentRepo.save(amd);
  }

  async getAmendmentsByProject(projectId: string): Promise<POAmendment[]> {
    return this.poAmendmentRepo.find({ where: { projectId } });
  }

  async getAmendmentRegister(): Promise<POAmendment[]> {
    return this.poAmendmentRepo.find();
  }

  async getAmendmentsByTrigger(triggerType: string): Promise<POAmendment[]> {
    return this.poAmendmentRepo.find({ where: { triggerType } });
  }

  async getPendingApprovals(): Promise<POAmendment[]> {
    return this.poAmendmentRepo.find({ where: { status: 'IMPACT_ANALYSIS' } }); // simplified check
  }
}
