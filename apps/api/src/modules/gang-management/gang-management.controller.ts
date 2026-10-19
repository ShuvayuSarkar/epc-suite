import { Controller, Post, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { GangManagementService } from './gang-management.service';
import { CreateGangDto } from './dto/create-gang.dto';
import { RecordEfficiencyDto } from './dto/record-efficiency.dto';

@Controller('api/v1/gangs')
export class GangManagementController {
  constructor(private readonly gangService: GangManagementService) {}

  @Post()
  async createGang(@Body() dto: CreateGangDto) {
    return this.gangService.createGang(dto);
  }

  @Patch(':id/mobilize')
  async mobilizeGang(
    @Param('id') id: string,
    @Body('date') date: string
  ) {
    return this.gangService.mobilizeGang(id, date);
  }

  @Patch(':id/demobilize')
  async demobilizeGang(
    @Param('id') id: string,
    @Body('date') date: string
  ) {
    return this.gangService.demobilizeGang(id, date);
  }

  @Post(':id/efficiency')
  async recordDailyEfficiency(
    @Param('id') id: string,
    @Body() dto: RecordEfficiencyDto
  ) {
    return this.gangService.recordDailyEfficiency(id, dto);
  }

  @Get('by-project/:projectId')
  async getGangsByProject(@Param('projectId') projectId: string) {
    return this.gangService.getGangsByProject(projectId);
  }

  @Get(':id/efficiency')
  async getGangEfficiency(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    if (startDate && endDate) {
      return this.gangService.getGangEfficiency(id, { startDate, endDate });
    }
    return this.gangService.getGangEfficiency(id);
  }

  @Get('utilization/:projectId')
  async getGangUtilization(@Param('projectId') projectId: string) {
    return this.gangService.getGangUtilization(projectId);
  }

  @Get('productivity/:projectId')
  async getProductivityByTerrain(@Param('projectId') projectId: string) {
    return this.gangService.getProductivityByTerrain(projectId);
  }
}
