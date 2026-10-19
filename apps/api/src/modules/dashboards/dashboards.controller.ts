import { Controller, Get, Param } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';

@Controller('api/v1/dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get('pm/:projectId')
  getPMDashboard(@Param('projectId') projectId: string) {
    return this.dashboardsService.getPMDashboard(projectId);
  }

  @Get('pd')
  getPDDashboard() {
    return this.dashboardsService.getPDDashboard();
  }

  @Get('finance/:projectId')
  getFinanceDashboard(@Param('projectId') projectId: string) {
    return this.dashboardsService.getFinanceDashboard(projectId);
  }

  @Get('client/:projectId')
  getClientDashboard(@Param('projectId') projectId: string) {
    return this.dashboardsService.getClientDashboard(projectId);
  }

  @Get('executive')
  getExecutiveSummary() {
    return this.dashboardsService.getExecutiveSummary();
  }

  @Get('benchmarks/:projectId')
  getBenchmarkReport(@Param('projectId') projectId: string) {
    return this.dashboardsService.getBenchmarkReport(projectId);
  }

  @Get('gang-productivity/:projectId')
  getGangProductivity(@Param('projectId') projectId: string) {
    return this.dashboardsService.getGangProductivityDashboard(projectId);
  }

  @Get('hotspots/:projectId')
  getHotspots(@Param('projectId') projectId: string) {
    return this.dashboardsService.getHotspotDashboard(projectId);
  }

  @Get('quality/:projectId')
  getQuality(@Param('projectId') projectId: string) {
    return this.dashboardsService.getQualityDashboard(projectId);
  }
}
