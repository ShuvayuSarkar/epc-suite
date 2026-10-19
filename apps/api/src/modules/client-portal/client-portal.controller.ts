import { Controller, Get, Param } from '@nestjs/common';
import { ClientPortalService } from './client-portal.service';

@Controller('api/v1/portal')
export class ClientPortalController {
  constructor(private readonly clientPortalService: ClientPortalService) {}

  @Get(':clientId/projects/:projectId/overview')
  getOverview(@Param('clientId') clientId: string, @Param('projectId') projectId: string) {
    return this.clientPortalService.getProjectOverview(clientId, projectId);
  }

  @Get(':clientId/projects/:projectId/documents')
  getDocuments(@Param('clientId') clientId: string, @Param('projectId') projectId: string) {
    return this.clientPortalService.getDocumentLibrary(clientId, projectId);
  }

  @Get(':clientId/projects/:projectId/milestones')
  getMilestones(@Param('clientId') clientId: string, @Param('projectId') projectId: string) {
    return this.clientPortalService.getMilestoneTracker(clientId, projectId);
  }

  @Get(':clientId/projects/:projectId/rfis')
  getRFIs(@Param('clientId') clientId: string, @Param('projectId') projectId: string) {
    return this.clientPortalService.getRFIView(clientId, projectId);
  }

  @Get(':clientId/projects/:projectId/punch-list')
  getPunchList(@Param('clientId') clientId: string, @Param('projectId') projectId: string) {
    return this.clientPortalService.getPunchListView(clientId, projectId);
  }

  @Get(':clientId/projects/:projectId/approvals')
  getApprovals(@Param('clientId') clientId: string, @Param('projectId') projectId: string) {
    return this.clientPortalService.getApprovalQueue(clientId, projectId);
  }

  @Get(':clientId/projects/:projectId/handover')
  getHandover(@Param('clientId') clientId: string, @Param('projectId') projectId: string) {
    return this.clientPortalService.getHandoverPackage(clientId, projectId);
  }

  @Get(':clientId/projects/:projectId/dlp')
  getDLP(@Param('clientId') clientId: string, @Param('projectId') projectId: string) {
    return this.clientPortalService.getDLPStatus(clientId, projectId);
  }
}
