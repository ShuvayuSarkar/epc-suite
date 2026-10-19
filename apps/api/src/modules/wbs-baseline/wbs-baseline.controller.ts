import { Controller, Get, Post, Body, Patch, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { WbsBaselineService } from './wbs-baseline.service';
import { CreateWbsDto } from './dto/create-wbs.dto';
import { CreateBaselineDto } from './dto/create-baseline.dto';

@Controller('api/v1/wbs')
export class WbsBaselineController {
  constructor(private readonly wbsBaselineService: WbsBaselineService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createWBS(@Body() createWbsDto: CreateWbsDto) {
    return this.wbsBaselineService.createWBS(createWbsDto);
  }

  @Get('tree/:contractId')
  getTree(@Param('contractId') contractId: string) {
    return this.wbsBaselineService.getWBSTree(contractId);
  }

  @Post(':parentId/children')
  @HttpCode(HttpStatus.CREATED)
  addChild(@Param('parentId') parentId: string, @Body() createWbsDto: CreateWbsDto) {
    return this.wbsBaselineService.addChild(parentId, createWbsDto);
  }

  @Post('baselines')
  @HttpCode(HttpStatus.CREATED)
  createBaseline(@Body() createBaselineDto: CreateBaselineDto) {
    return this.wbsBaselineService.createBaseline(
      createBaselineDto.projectId,
      createBaselineDto.type,
      createBaselineDto.data,
    );
  }

  @Patch('baselines/:id/lock')
  lockBaseline(@Param('id') id: string) {
    return this.wbsBaselineService.lockBaseline(id);
  }

  @Get('baselines/:projectId/dual')
  getDualBaselines(@Param('projectId') projectId: string) {
    return this.wbsBaselineService.getDualBaselines(projectId);
  }

  @Get('baselines/:projectId/compare')
  compareBaselines(@Param('projectId') projectId: string) {
    return this.wbsBaselineService.compareBaselines(projectId);
  }
}
