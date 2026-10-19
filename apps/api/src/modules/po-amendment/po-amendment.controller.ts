import { Controller, Get, Post, Body, Patch, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { PoAmendmentService } from './po-amendment.service';
import { RequestAmendmentDto } from './dto/request-amendment.dto';
import { ImpactAnalysisDto } from './dto/impact-analysis.dto';

@Controller('api/v1/po-amendments')
export class PoAmendmentController {
  constructor(private readonly poAmendmentService: PoAmendmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  request(@Body() requestAmendmentDto: RequestAmendmentDto) {
    return this.poAmendmentService.requestAmendment(requestAmendmentDto);
  }

  @Post(':id/impact-analysis')
  @HttpCode(HttpStatus.OK)
  impactAnalysis(@Param('id') id: string, @Body() dto: ImpactAnalysisDto) {
    return this.poAmendmentService.performImpactAnalysis(id, dto);
  }

  @Patch(':id/internal-approve')
  internalApprove(@Param('id') id: string, @Body('approverRole') role: string, @Body('approved') approved: boolean) {
    return this.poAmendmentService.internalApproval(id, role, approved);
  }

  @Patch(':id/client-approval')
  clientApproval(@Param('id') id: string, @Body('approved') approved: boolean) {
    return this.poAmendmentService.recordClientApproval(id, approved);
  }

  @Patch(':id/issue')
  issue(@Param('id') id: string, @Body('amendedPONumber') amendedPONumber: string) {
    return this.poAmendmentService.issueAmendedPO(id, amendedPONumber);
  }

  @Patch(':id/implement')
  implement(@Param('id') id: string) {
    return this.poAmendmentService.implementAmendment(id);
  }

  @Get('by-project/:projectId')
  getByProject(@Param('projectId') projectId: string) {
    return this.poAmendmentService.getAmendmentsByProject(projectId);
  }

  @Get('register')
  getRegister() {
    return this.poAmendmentService.getAmendmentRegister();
  }

  @Get('pending')
  getPending() {
    return this.poAmendmentService.getPendingApprovals();
  }
}
