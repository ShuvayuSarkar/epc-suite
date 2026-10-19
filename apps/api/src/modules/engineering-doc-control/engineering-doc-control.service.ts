import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EngineeringDocument } from '../../database/entities/engineering-document.entity';
import { Project } from '../../database/entities/project.entity';
import { Client } from '../../database/entities/client.entity';
import { RegisterDocumentDto, DocumentType } from './dto/register-document.dto';
import { RecordApprovalDto, ApprovalDecision } from './dto/record-approval.dto';

@Injectable()
export class EngineeringDocControlService {
  constructor(
    @InjectRepository(EngineeringDocument)
    private readonly engineeringDocRepo: Repository<EngineeringDocument>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  async registerDocument(dto: RegisterDocumentDto): Promise<EngineeringDocument> {
    const doc = this.engineeringDocRepo.create({
      ProjectID: dto.projectId,
      DocumentType: dto.documentType as any,
      MaterialCategoryID: dto.materialCategoryId,
      Version: 1,
      Status: 'DRAFT' as any,
      FileURL: (dto as any).fileUrl || null,
    } as any);
    return this.engineeringDocRepo.save(doc as any) as any;
  }

  async submitToClient(documentId: string): Promise<EngineeringDocument> {
    const doc = await this.engineeringDocRepo.findOne({ where: { DocumentID: documentId } as any });
    if (!doc) throw new NotFoundException('Document not found');
    
    doc.Status = 'SUBMITTED' as any;
    doc.SubmittedDate = new Date();
    return this.engineeringDocRepo.save(doc);
  }

  async recordClientApproval(documentId: string, dto: RecordApprovalDto): Promise<EngineeringDocument> {
    const doc = await this.engineeringDocRepo.findOne({ where: { DocumentID: documentId } as any });
    if (!doc) throw new NotFoundException('Document not found');

    doc.Status = dto.decision as any;
    doc.ApprovedDate = dto.approvedDate ? new Date(dto.approvedDate) : new Date();
    return this.engineeringDocRepo.save(doc);
  }

  async createNewVersion(documentId: string): Promise<EngineeringDocument> {
    const doc = await this.engineeringDocRepo.findOne({ where: { DocumentID: documentId } as any });
    if (!doc) throw new NotFoundException('Document not found');

    const newDoc = this.engineeringDocRepo.create({
      ProjectID: doc.ProjectID,
      DocumentType: doc.DocumentType,
      MaterialCategoryID: doc.MaterialCategoryID,
      Version: (doc.Version || 1) + 1,
      Status: 'DRAFT' as any,
      FileURL: doc.FileURL,
    } as any);
    return this.engineeringDocRepo.save(newDoc as any) as any;
  }

  async findByProject(projectId: string): Promise<EngineeringDocument[]> {
    return this.engineeringDocRepo.find({ where: { ProjectID: projectId } as any });
  }

  async findByCategory(projectId: string, materialCategoryId: string): Promise<EngineeringDocument[]> {
    return this.engineeringDocRepo.find({ where: { ProjectID: projectId, MaterialCategoryID: materialCategoryId } as any });
  }

  async findByType(projectId: string, documentType: DocumentType): Promise<EngineeringDocument[]> {
    return this.engineeringDocRepo.find({ where: { ProjectID: projectId, DocumentType: documentType as any } as any });
  }

  async getApprovalTracker(projectId: string): Promise<any> {
    const docs = await this.findByProject(projectId);
    return {
      projectId,
      total: docs.length,
      submitted: docs.filter(d => (d.Status as any) === 'SUBMITTED').length,
      approved: docs.filter(d => (d.Status as any) === 'APPROVED').length,
      rejected: docs.filter(d => (d.Status as any) === 'REJECTED').length,
      pending: docs.filter(d => (d.Status as any) === 'DRAFT').length,
      documents: docs,
    };
  }

  async getOverdueDocuments(projectId: string): Promise<EngineeringDocument[]> {
    const docs = await this.findByProject(projectId);
    return docs.filter(doc => (doc.Status as any) === 'SUBMITTED');
  }

  async getVersionHistory(documentId: string): Promise<EngineeringDocument[]> {
    const doc = await this.engineeringDocRepo.findOne({ where: { DocumentID: documentId } as any });
    if (!doc) return [];
    return this.engineeringDocRepo.find({
      where: { ProjectID: doc.ProjectID, DocumentType: doc.DocumentType } as any,
      order: { Version: 'ASC' } as any,
    });
  }
}
