import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSurvey } from './entities/site-survey.entity';
import { Project } from '../../database/entities/project.entity';
import { CreateSiteSurveyDto } from './dto/create-site-survey.dto';

export interface SurveySummary {
  total: number;
  gpsTagged: number;
  gpsCoveragePercent: number;
  byType: Record<string, number>;
}

@Injectable()
export class SiteSurveyService {
  constructor(
    @InjectRepository(SiteSurvey)
    private siteSurveyRepository: Repository<SiteSurvey>,
  ) {}

  async createSurvey(dto: CreateSiteSurveyDto): Promise<SiteSurvey> {
    const isGpsTagged = dto.GPSLat != null && dto.GPSLon != null;
    const survey = this.siteSurveyRepository.create({
      ...dto,
      IsGPSTagged: dto.IsGPSTagged ?? isGpsTagged,
    });
    return this.siteSurveyRepository.save(survey);
  }

  async findByProject(projectId: string): Promise<SiteSurvey[]> {
    return this.siteSurveyRepository.find({ where: { ProjectID: projectId } });
  }

  async findBySegment(projectId: string, segmentId: string): Promise<SiteSurvey[]> {
    return this.siteSurveyRepository.find({
      where: { ProjectID: projectId, LineSegmentID: segmentId },
    });
  }

  async findByType(projectId: string, surveyType: string): Promise<SiteSurvey[]> {
    return this.siteSurveyRepository.find({
      where: { ProjectID: projectId, SurveyType: surveyType },
    });
  }

  async getSurveySummary(projectId: string): Promise<SurveySummary> {
    const surveys = await this.findByProject(projectId);
    const total = surveys.length;
    const gpsTagged = surveys.filter(s => s.IsGPSTagged).length;
    
    const byType = surveys.reduce((acc, curr) => {
      acc[curr.SurveyType] = (acc[curr.SurveyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      gpsTagged,
      gpsCoveragePercent: total ? (gpsTagged / total) * 100 : 0,
      byType
    };
  }

  async markGPSTagged(surveyId: string): Promise<SiteSurvey> {
    const survey = await this.siteSurveyRepository.findOne({ where: { SurveyID: surveyId } });
    if (!survey) {
      throw new NotFoundException(`Survey with ID ${surveyId} not found`);
    }
    survey.IsGPSTagged = true;
    return this.siteSurveyRepository.save(survey);
  }

  async getSurveyCompletionStatus(projectId: string): Promise<boolean> {
    const surveys = await this.findByProject(projectId);
    const hasConductor = surveys.some(s => s.SurveyType === 'CONDUCTOR_LENGTH');
    const hasSubstation = surveys.some(s => s.SurveyType === 'SUBSTATION_BAY');
    return hasConductor && hasSubstation;
  }
}
