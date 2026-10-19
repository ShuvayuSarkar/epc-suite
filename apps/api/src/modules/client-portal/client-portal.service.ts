import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../database/entities/project.entity';
import { Client } from '../../database/entities/client.entity';
import { Milestone } from '../../database/entities/milestone.entity';
import { EngineeringDocument } from '../../database/entities/engineering-document.entity';
import { RFI } from '../../database/entities/rfi.entity';
import { PunchListItem } from '../../database/entities/punch-list-item.entity';
import { Correspondence } from '../../database/entities/correspondence.entity';

@Injectable()
export class ClientPortalService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    @InjectRepository(Milestone) private readonly milestoneRepo: Repository<Milestone>,
    @InjectRepository(EngineeringDocument) private readonly docRepo: Repository<EngineeringDocument>,
    @InjectRepository(RFI) private readonly rfiRepo: Repository<RFI>,
    @InjectRepository(PunchListItem) private readonly punchListRepo: Repository<PunchListItem>,
    @InjectRepository(Correspondence) private readonly corrRepo: Repository<Correspondence>,
  ) {}

  private async validateAccess(clientId: string, projectId: string): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { ProjectID: projectId } as any });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ClientID !== clientId) {
      throw new ForbiddenException('Client does not have access to this project');
    }
  }

  async getProjectOverview(clientId: string, projectId: string) {
    await this.validateAccess(clientId, projectId);
    return {
      projectId,
      rag: 'GREEN',
      milestonePct: 45,
      segmentRollup: [],
      sCurveData: {},
    };
  }

  async getDocumentLibrary(clientId: string, projectId: string) {
    await this.validateAccess(clientId, projectId);
    return this.docRepo.find({ where: { ProjectID: projectId, Status: 'APPROVED' as any } as any });
  }

  async getMilestoneTracker(clientId: string, projectId: string) {
    await this.validateAccess(clientId, projectId);
    return this.milestoneRepo.find({ where: { ProjectID: projectId } as any });
  }

  async getRFIView(clientId: string, projectId: string) {
    await this.validateAccess(clientId, projectId);
    return this.rfiRepo.find({ where: { ProjectID: projectId } as any });
  }

  async getPunchListView(clientId: string, projectId: string) {
    await this.validateAccess(clientId, projectId);
    return this.punchListRepo.find({ where: { ProjectID: projectId } as any });
  }

  async getApprovalQueue(clientId: string, projectId: string) {
    await this.validateAccess(clientId, projectId);
    return {
      documents: await this.docRepo.find({ where: { ProjectID: projectId, Status: 'SUBMITTED' as any } as any }),
      amendments: [],
    };
  }

  async getHandoverPackage(clientId: string, projectId: string) {
    await this.validateAccess(clientId, projectId);
    return {
      status: 'In Progress',
      documentsAvailable: [],
    };
  }

  async getDLPStatus(clientId: string, projectId: string) {
    await this.validateAccess(clientId, projectId);
    return {
      dlpStartDate: null,
      dlpEndDate: null,
      issuesReported: 0,
      issuesResolved: 0,
    };
  }
}
