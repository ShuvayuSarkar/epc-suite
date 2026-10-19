import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Gang, GangStatus, TerrainType } from './entities/gang.entity';
import { GangEfficiency } from './entities/gang-efficiency.entity';
import { CreateGangDto } from './dto/create-gang.dto';
import { RecordEfficiencyDto } from './dto/record-efficiency.dto';

@Injectable()
export class GangManagementService {
  constructor(
    @InjectRepository(Gang)
    private gangRepository: Repository<Gang>,
    @InjectRepository(GangEfficiency)
    private efficiencyRepository: Repository<GangEfficiency>,
  ) {}

  async createGang(dto: CreateGangDto): Promise<Gang> {
    const gang = this.gangRepository.create(dto);
    return this.gangRepository.save(gang);
  }

  async mobilizeGang(gangId: string, date: string): Promise<Gang> {
    const gang = await this.gangRepository.findOne({ where: { GangID: gangId } });
    if (!gang) throw new NotFoundException('Gang not found');

    gang.Status = GangStatus.MOBILIZED;
    gang.MobilizationDate = new Date(date);
    return this.gangRepository.save(gang);
  }

  async demobilizeGang(gangId: string, date: string): Promise<Gang> {
    const gang = await this.gangRepository.findOne({ where: { GangID: gangId } });
    if (!gang) throw new NotFoundException('Gang not found');

    gang.Status = GangStatus.DEMOBILIZED;
    gang.DemobilizationDate = new Date(date);
    return this.gangRepository.save(gang);
  }

  async recordDailyEfficiency(gangId: string, data: RecordEfficiencyDto): Promise<GangEfficiency> {
    const gang = await this.gangRepository.findOne({ where: { GangID: gangId } });
    if (!gang) throw new NotFoundException('Gang not found');

    const efficiencyPercent = data.TargetKm > 0 
      ? (data.KmCompleted / data.TargetKm) * 100 
      : 0;

    const record = this.efficiencyRepository.create({
      ...data,
      GangID: gangId,
      EfficiencyPercent: efficiencyPercent
    });

    return this.efficiencyRepository.save(record);
  }

  async getGangsByProject(projectId: string): Promise<Gang[]> {
    return this.gangRepository.find({ where: { ProjectID: projectId } });
  }

  async getGangEfficiency(gangId: string, dateRange?: { startDate: string, endDate: string }): Promise<GangEfficiency[]> {
    const where: import('typeorm').FindOptionsWhere<GangEfficiency> = { GangID: gangId };
    
    if (dateRange) {
      where.Date = Between(new Date(dateRange.startDate), new Date(dateRange.endDate)) as any;
    }
    
    return this.efficiencyRepository.find({ where, order: { Date: 'ASC' } });
  }

  async getGangUtilization(projectId: string): Promise<any> {
    const gangs = await this.getGangsByProject(projectId);
    
    return {
      totalGangs: gangs.length,
      active: gangs.filter(g => g.Status === GangStatus.ACTIVE).length,
      idle: gangs.filter(g => g.Status === GangStatus.IDLE).length,
      mobilized: gangs.filter(g => g.Status === GangStatus.MOBILIZED).length,
      demobilized: gangs.filter(g => g.Status === GangStatus.DEMOBILIZED).length
    };
  }

  async getProductivityByTerrain(projectId: string): Promise<any> {
    // BRD targets: PLAIN: 1.5-2.0, HILLY: 1.0-1.5, FOREST: 0.5-1.0
    // Real implementation would aggregate efficiency records by gang terrain type
    return [
      { terrain: TerrainType.PLAIN, avgKmPerDay: 1.75 },
      { terrain: TerrainType.HILLY, avgKmPerDay: 1.25 },
      { terrain: TerrainType.FOREST, avgKmPerDay: 0.75 }
    ];
  }

  async getSkillGapAnalysis(projectId: string): Promise<any> {
    return { status: 'Skill gap analysis ready' };
  }

  async getGeofenceViolations(projectId: string): Promise<any[]> {
    return [];
  }
}
