import { Controller, Post, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { InstallationExecutionService } from './installation-execution.service';
import { SubmitDprDto } from './dto/submit-dpr.dto';
import { CreateJmcDto } from './dto/create-jmc.dto';

@Controller('api/v1/installation')
export class InstallationExecutionController {
  constructor(private readonly installationService: InstallationExecutionService) {}

  @Post('dpr')
  async submitDPR(@Body() dto: SubmitDprDto) {
    return this.installationService.submitDPR(dto);
  }

  @Get('dpr/:projectId')
  async getDPRsByProject(
    @Param('projectId') projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (startDate && endDate) {
      return this.installationService.getDPRsByProject(projectId, { startDate, endDate });
    }
    return this.installationService.getDPRsByProject(projectId);
  }

  @Post('jmc')
  async createJMC(@Body() dto: CreateJmcDto) {
    return this.installationService.createJMC(dto);
  }

  @Patch('jmc/:id/sign')
  async signJMC(
    @Param('id') id: string,
    @Body('signedBy') signedBy: string
  ) {
    return this.installationService.signJMC(id, signedBy);
  }

  @Get('jmc-status/:projectId')
  async getJMCStatus(@Param('projectId') projectId: string) {
    return this.installationService.getJMCStatus(projectId);
  }

  @Get('progress/:projectId')
  async getInstallationProgress(@Param('projectId') projectId: string) {
    return this.installationService.getInstallationProgress(projectId);
  }
}
