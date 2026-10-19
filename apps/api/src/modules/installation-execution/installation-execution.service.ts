import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DailyDPR } from './entities/daily-dpr.entity';
import { JMCRecord } from './entities/jmc.entity';
import { SubmitDprDto } from './dto/submit-dpr.dto';
import { CreateJmcDto } from './dto/create-jmc.dto';

interface DateRange {
  startDate: string;
  endDate: string;
}

@Injectable()
export class InstallationExecutionService {
  constructor(
    @InjectRepository(DailyDPR)
    private dprRepository: Repository<DailyDPR>,
    @InjectRepository(JMCRecord)
    private jmcRepository: Repository<JMCRecord>,
  ) {}

  async submitDPR(dto: SubmitDprDto): Promise<DailyDPR> {
    const isGeofenced = dto.GPSLat != null && dto.GPSLon != null;
    const dpr = this.dprRepository.create({
      ...dto,
      IsGeofenced: dto.IsGeofenced ?? isGeofenced,
    });
    return this.dprRepository.save(dpr);
  }

  async getDPRsByProject(projectId: string, dateRange?: DateRange): Promise<DailyDPR[]> {
    const where: import('typeorm').FindOptionsWhere<DailyDPR> = { ProjectID: projectId };
    if (dateRange) {
      where.ReportDate = Between(new Date(dateRange.startDate), new Date(dateRange.endDate)) as any;
    }
    return this.dprRepository.find({ where });
  }

  async getDPRsByGang(gangId: string, dateRange?: DateRange): Promise<DailyDPR[]> {
    const where: import('typeorm').FindOptionsWhere<DailyDPR> = { GangID: gangId };
    if (dateRange) {
      where.ReportDate = Between(new Date(dateRange.startDate), new Date(dateRange.endDate)) as any;
    }
    return this.dprRepository.find({ where });
  }

  async getDailyProgress(projectId: string, date: string): Promise<DailyDPR[]> {
    return this.dprRepository.find({
      where: {
        ProjectID: projectId,
        ReportDate: new Date(date),
      },
    });
  }

  async createJMC(dto: CreateJmcDto): Promise<JMCRecord> {
    const jmc = this.jmcRepository.create(dto);
    return this.jmcRepository.save(jmc);
  }

  async signJMC(jmcId: string, signedBy: string): Promise<JMCRecord> {
    const jmc = await this.jmcRepository.findOne({ where: { JMCID: jmcId } });
    if (!jmc) {
      throw new NotFoundException(`JMC Record with ID ${jmcId} not found`);
    }
    jmc.IsSigned = true;
    jmc.SignedBy = signedBy;
    jmc.SignedDate = new Date();
    return this.jmcRepository.save(jmc);
  }

  async getJMCStatus(projectId: string): Promise<{ lineSigned: boolean; substationSigned: boolean }> {
    const jmcs = await this.jmcRepository.find({ where: { ProjectID: projectId } });
    
    const lineSigned = jmcs.some(j => j.JMCType === 'LINE' && j.IsSigned);
    const substationSigned = jmcs.some(j => j.JMCType === 'SUBSTATION' && j.IsSigned);

    return { lineSigned, substationSigned };
  }

  async getInstallationProgress(projectId: string): Promise<{ totalKmInstalled: number; averageProductivityKmPerDay: number; totalDprs: number; efficiencyVsL2: string }> {
    const dprs = await this.getDPRsByProject(projectId);
    const totalKm = dprs.reduce((acc, curr) => acc + Number(curr.KmInstalled), 0);
    const avgProductivity = dprs.length ? totalKm / dprs.length : 0;
    
    return {
      totalKmInstalled: totalKm,
      averageProductivityKmPerDay: avgProductivity,
      totalDprs: dprs.length,
      efficiencyVsL2: 'N/A' // Placeholder for L2 schedule integration
    };
  }

  async getGangProductivity(gangId: string, terrain: string): Promise<{ gangId: string; terrain: string; totalKm: number; daysReported: number; avgKmPerDay: number }> {
    const dprs = await this.getDPRsByGang(gangId);
    const totalKm = dprs.reduce((acc, curr) => acc + Number(curr.KmInstalled), 0);
    const avgKmPerDay = dprs.length ? totalKm / dprs.length : 0;
    
    return {
      gangId,
      terrain,
      totalKm,
      daysReported: dprs.length,
      avgKmPerDay
    };
  }
}
