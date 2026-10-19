import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { SiteSurveyService } from './site-survey.service';
import { CreateSiteSurveyDto } from './dto/create-site-survey.dto';

@Controller('api/v1/site-surveys')
export class SiteSurveyController {
  constructor(private readonly siteSurveyService: SiteSurveyService) {}

  @Post()
  async createSurvey(@Body() dto: CreateSiteSurveyDto) {
    return this.siteSurveyService.createSurvey(dto);
  }

  @Get('by-project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    return this.siteSurveyService.findByProject(projectId);
  }

  @Get('by-segment/:projectId/:segmentId')
  async findBySegment(
    @Param('projectId') projectId: string,
    @Param('segmentId') segmentId: string,
  ) {
    return this.siteSurveyService.findBySegment(projectId, segmentId);
  }

  @Get('summary/:projectId')
  async getSurveySummary(@Param('projectId') projectId: string) {
    return this.siteSurveyService.getSurveySummary(projectId);
  }

  @Get('completion/:projectId')
  async getSurveyCompletionStatus(@Param('projectId') projectId: string) {
    const isComplete = await this.siteSurveyService.getSurveyCompletionStatus(projectId);
    return { isComplete };
  }

  @Patch(':id/gps-tag')
  async markGPSTagged(@Param('id') id: string) {
    return this.siteSurveyService.markGPSTagged(id);
  }
}
