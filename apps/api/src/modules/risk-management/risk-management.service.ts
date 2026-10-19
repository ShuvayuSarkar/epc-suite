import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Risk, RiskStatus, RiskProbability, RiskImpact } from './entities/risk.entity';
import { IdentifyRiskDto } from './dto/identify-risk.dto';

export interface ExposureDashboard {
  totalRisks: number;
  openRisks: number;
  highRisks: number;
  closedRisks: number;
}

@Injectable()
export class RiskManagementService {
  constructor(
    @InjectRepository(Risk)
    private riskRepository: Repository<Risk>,
  ) {}

  async identifyRisk(dto: IdentifyRiskDto): Promise<Risk> {
    const risk = this.riskRepository.create({
      ...dto,
      Status: RiskStatus.IDENTIFIED,
    });
    return this.riskRepository.save(risk);
  }

  async assessRisk(riskId: string, probability: RiskProbability, impact: RiskImpact): Promise<Risk> {
    const risk = await this.riskRepository.findOne({ where: { RiskID: riskId } });
    if (!risk) throw new NotFoundException(`Risk with ID ${riskId} not found`);

    risk.Probability = probability;
    risk.Impact = impact;
    risk.RiskScore = probability * impact;
    risk.Status = RiskStatus.ASSESSED;
    
    return this.riskRepository.save(risk);
  }

  async addMitigationPlan(riskId: string, plan: string, owner: string): Promise<Risk> {
    const risk = await this.riskRepository.findOne({ where: { RiskID: riskId } });
    if (!risk) throw new NotFoundException(`Risk with ID ${riskId} not found`);

    risk.MitigationPlan = plan;
    risk.MitigationOwner = owner;
    risk.Status = RiskStatus.MITIGATING;

    return this.riskRepository.save(risk);
  }

  async updateStatus(riskId: string, status: RiskStatus): Promise<Risk> {
    const risk = await this.riskRepository.findOne({ where: { RiskID: riskId } });
    if (!risk) throw new NotFoundException(`Risk with ID ${riskId} not found`);

    risk.Status = status;
    return this.riskRepository.save(risk);
  }

  async closeRisk(riskId: string, lessonsLearned: string): Promise<Risk> {
    const risk = await this.riskRepository.findOne({ where: { RiskID: riskId } });
    if (!risk) throw new NotFoundException(`Risk with ID ${riskId} not found`);

    risk.Status = RiskStatus.CLOSED;
    risk.ActualClosureDate = new Date();
    risk.LessonsLearned = lessonsLearned;

    return this.riskRepository.save(risk);
  }

  async getRisksByProject(projectId: string): Promise<Risk[]> {
    return this.riskRepository.find({ where: { ProjectID: projectId } });
  }

  async getRiskRegister(projectId: string): Promise<Risk[]> {
    return this.riskRepository.find({
      where: { ProjectID: projectId },
      order: { RiskScore: 'DESC' }
    });
  }

  async getRiskHeatMap(projectId: string): Promise<any[]> {
    const risks = await this.getRisksByProject(projectId);
    // Group by PxI coordinates for heatmap rendering
    const heatMap = risks.reduce((acc, r) => {
      if (r.Probability && r.Impact) {
        const key = `${r.Probability}_${r.Impact}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(heatMap).map(([key, count]) => {
      const [p, i] = key.split('_');
      return { probability: Number(p), impact: Number(i), count };
    });
  }

  async getExposureDashboard(projectId: string): Promise<ExposureDashboard> {
    const risks = await this.getRisksByProject(projectId);
    
    return {
      totalRisks: risks.length,
      openRisks: risks.filter(r => r.Status !== RiskStatus.CLOSED).length,
      highRisks: risks.filter(r => (r.RiskScore ?? 0) > 9 && r.Status !== RiskStatus.CLOSED).length,
      closedRisks: risks.filter(r => r.Status === RiskStatus.CLOSED).length
    };
  }

  async getHighRiskItems(projectId: string): Promise<Risk[]> {
    const risks = await this.getRisksByProject(projectId);
    return risks.filter(r => (r.RiskScore ?? 0) > 9);
  }
}
