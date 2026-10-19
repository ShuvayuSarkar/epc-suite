import { Controller, Get, Post, Body, Patch, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { CorrespondenceService } from './correspondence.service';
import { DraftCorrespondenceDto } from './dto/draft-correspondence.dto';

@Controller('api/v1/correspondence')
export class CorrespondenceController {
  constructor(private readonly correspondenceService: CorrespondenceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  draft(@Body() draftCorrespondenceDto: DraftCorrespondenceDto) {
    return this.correspondenceService.draftCorrespondence(draftCorrespondenceDto);
  }

  @Patch(':id/review')
  submitForReview(@Param('id') id: string) {
    return this.correspondenceService.submitForReview(id);
  }

  @Patch(':id/sign')
  sign(@Param('id') id: string, @Body('signedBy') signedBy: string) {
    return this.correspondenceService.signCorrespondence(id, signedBy);
  }

  @Patch(':id/dispatch')
  dispatch(@Param('id') id: string, @Body('dispatchDate') dispatchDate: string) {
    return this.correspondenceService.dispatchCorrespondence(id, new Date(dispatchDate));
  }

  @Patch(':id/acknowledge')
  acknowledge(@Param('id') id: string, @Body('ackDate') ackDate: string) {
    return this.correspondenceService.recordAcknowledgment(id, new Date(ackDate));
  }

  @Get('by-project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.correspondenceService.findByProject(projectId);
  }

  @Get('dispatch-register/:projectId')
  getDispatchRegister(@Param('projectId') projectId: string) {
    return this.correspondenceService.getDispatchRegister(projectId);
  }
}
