import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WBS } from '../../database/entities/wbs.entity';
import { Baseline } from '../../database/entities/baseline.entity';
import { Project } from '../../database/entities/project.entity';
import { CreateWbsDto } from './dto/create-wbs.dto';
import { CreateBaselineDto, BaselineType } from './dto/create-baseline.dto';

@Injectable()
export class WbsBaselineService {
  constructor(
    @InjectRepository(WBS)
    private readonly wbsRepository: Repository<WBS>,
    @InjectRepository(Baseline)
    private readonly baselineRepository: Repository<Baseline>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async createWBS(dto: CreateWbsDto): Promise<WBS> {
    const node = this.wbsRepository.create(dto as any);
    return this.wbsRepository.save(node as any) as any;
  }

  async getWBSTree(contractId: string): Promise<WBS[]> {
    return this.wbsRepository.find({
      where: { ContractID: contractId } as any,
    });
  }

  async addChild(parentWbsId: string, dto: CreateWbsDto): Promise<WBS> {
    const parent = await this.wbsRepository.findOne({ where: { WBSID: parentWbsId } as any });
    if (!parent) {
      throw new NotFoundException(`Parent WBS with ID ${parentWbsId} not found`);
    }

    const child = this.wbsRepository.create({
      ...(dto as any),
      ParentWBSID: parentWbsId,
    } as any);
    return this.wbsRepository.save(child as any) as any;
  }

  async createBaseline(projectId: string, type: BaselineType, data: Record<string, any>): Promise<Baseline> {
    const project = await this.projectRepository.findOne({ where: { ProjectID: projectId } as any });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const baseline = this.baselineRepository.create({
      ProjectID: projectId,
      Type: type as any,
      GovernsLD: type === BaselineType.CONTRACTUAL,
    } as any);

    return this.baselineRepository.save(baseline as any) as any;
  }

  async lockBaseline(baselineId: string): Promise<Baseline> {
    const baseline = await this.baselineRepository.findOne({ where: { BaselineID: baselineId } as any });
    if (!baseline) {
      throw new NotFoundException(`Baseline with ID ${baselineId} not found`);
    }

    baseline.LockedDate = new Date();
    return this.baselineRepository.save(baseline);
  }

  async getActiveBaseline(projectId: string, type: BaselineType): Promise<Baseline | null> {
    return this.baselineRepository.findOne({
      where: { ProjectID: projectId, Type: type as any } as any,
      order: { CreatedAt: 'DESC' } as any,
    });
  }

  async getDualBaselines(projectId: string): Promise<{ contractual: Baseline | null; accelerated: Baseline | null }> {
    const contractual = await this.getActiveBaseline(projectId, BaselineType.CONTRACTUAL);
    const accelerated = await this.getActiveBaseline(projectId, BaselineType.ACCELERATED);
    
    return { contractual, accelerated };
  }

  async compareBaselines(projectId: string): Promise<any> {
    const { contractual, accelerated } = await this.getDualBaselines(projectId);
    
    if (!contractual || !accelerated) {
      return {
        variance: 'Baseline comparison pending - both contractual and accelerated required.',
        contractualId: contractual?.BaselineID || null,
        acceleratedId: accelerated?.BaselineID || null,
      };
    }

    return {
      variance: 'On Track',
      contractualId: contractual.BaselineID,
      acceleratedId: accelerated.BaselineID,
    };
  }

  async getSegmentRollup(contractId: string): Promise<any> {
    return {
      contractId,
      progress: 0,
      status: 'pending rollup calculation'
    };
  }
}
