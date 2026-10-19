import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { RiskManagementService } from './risk-management.service';
import { IdentifyRiskDto } from './dto/identify-risk.dto';
import { AssessRiskDto } from './dto/assess-risk.dto';
import { RiskStatus } from './entities/risk.entity';

@Controller('api/v1/risks')
export class RiskManagementController {
  constructor(private readonly riskService: RiskManagementService) {}

  @Post()
  async identifyRisk(@Body() dto: IdentifyRiskDto) {
    return this.riskService.identifyRisk(dto);
  }

  @Patch(':id/assess')
  async assessRisk(
    @Param('id') id: string,
    @Body() dto: AssessRiskDto
  ) {
    return this.riskService.assessRisk(id, dto.Probability, dto.Impact);
  }

  @Patch(':id/mitigate')
  async addMitigationPlan(
    @Param('id') id: string,
    @Body('plan') plan: string,
    @Body('owner') owner: string
  ) {
    return this.riskService.addMitigationPlan(id, plan, owner);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: RiskStatus
  ) {
    return this.riskService.updateStatus(id, status);
  }

  @Patch(':id/close')
  async closeRisk(
    @Param('id') id: string,
    @Body('lessonsLearned') lessonsLearned: string
  ) {
    return this.riskService.closeRisk(id, lessonsLearned);
  }

  @Get('by-project/:projectId')
  async getRisksByProject(@Param('projectId') projectId: string) {
    return this.riskService.getRisksByProject(projectId);
  }

  @Get('register/:projectId')
  async getRiskRegister(@Param('projectId') projectId: string) {
    return this.riskService.getRiskRegister(projectId);
  }

  @Get('heatmap/:projectId')
  async getRiskHeatMap(@Param('projectId') projectId: string) {
    return this.riskService.getRiskHeatMap(projectId);
  }

  @Get('exposure/:projectId')
  async getExposureDashboard(@Param('projectId') projectId: string) {
    return this.riskService.getExposureDashboard(projectId);
  }

  @Get('high-risk/:projectId')
  async getHighRiskItems(@Param('projectId') projectId: string) {
    return this.riskService.getHighRiskItems(projectId);
  }
}
