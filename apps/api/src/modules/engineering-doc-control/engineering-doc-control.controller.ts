import { Controller, Get, Post, Body, Patch, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { EngineeringDocControlService } from './engineering-doc-control.service';
import { RegisterDocumentDto } from './dto/register-document.dto';
import { RecordApprovalDto } from './dto/record-approval.dto';

@Controller('api/v1/engineering-docs')
export class EngineeringDocControlController {
  constructor(private readonly engineeringDocControlService: EngineeringDocControlService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDocumentDto: RegisterDocumentDto) {
    return this.engineeringDocControlService.registerDocument(registerDocumentDto);
  }

  @Patch(':id/submit')
  submit(@Param('id') id: string) {
    return this.engineeringDocControlService.submitToClient(id);
  }

  @Patch(':id/approval')
  recordApproval(@Param('id') id: string, @Body() recordApprovalDto: RecordApprovalDto) {
    return this.engineeringDocControlService.recordClientApproval(id, recordApprovalDto);
  }

  @Post(':id/new-version')
  @HttpCode(HttpStatus.CREATED)
  newVersion(@Param('id') id: string) {
    return this.engineeringDocControlService.createNewVersion(id);
  }

  @Get('by-project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.engineeringDocControlService.findByProject(projectId);
  }

  @Get('tracker/:projectId')
  getTracker(@Param('projectId') projectId: string) {
    return this.engineeringDocControlService.getApprovalTracker(projectId);
  }

  @Get('overdue/:projectId')
  getOverdue(@Param('projectId') projectId: string) {
    return this.engineeringDocControlService.getOverdueDocuments(projectId);
  }

  @Get(':id/versions')
  getVersions(@Param('id') id: string) {
    return this.engineeringDocControlService.getVersionHistory(id);
  }
}
