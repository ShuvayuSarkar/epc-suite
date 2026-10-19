import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Correspondence } from '../../database/entities/correspondence.entity';
import { Project } from '../../database/entities/project.entity';
import { Client } from '../../database/entities/client.entity';
import { DraftCorrespondenceDto } from './dto/draft-correspondence.dto';

@Injectable()
export class CorrespondenceService {
  constructor(
    @InjectRepository(Correspondence)
    private readonly correspondenceRepo: Repository<Correspondence>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  async generateReferenceNumber(clientId: string, letterType: string): Promise<string> {
    const client = await this.clientRepo.findOne({ where: { ClientID: clientId } as any });
    if (!client) throw new NotFoundException('Client not found');

    const timestamp = Date.now().toString().slice(-6);
    const format = client.ReferenceFormat || `REF-{TYPE}-{ID}`;
    return format.replace('{TYPE}', letterType).replace('{ID}', timestamp);
  }

  async draftCorrespondence(dto: DraftCorrespondenceDto): Promise<Correspondence> {
    const referenceNumber = await this.generateReferenceNumber(dto.clientId, dto.letterType);

    const corr = this.correspondenceRepo.create({
      ProjectID: dto.projectId,
      ClientID: dto.clientId,
      LetterType: dto.letterType,
      DraftedBy: dto.draftedBy,
      ReferenceNumber: referenceNumber,
    } as any);
    return this.correspondenceRepo.save(corr as any) as any;
  }

  async submitForReview(corrId: string): Promise<Correspondence> {
    const corr = await this.correspondenceRepo.findOne({ where: { CorrespondenceID: corrId } as any });
    if (!corr) throw new NotFoundException('Correspondence not found');
    return corr;
  }

  async signCorrespondence(corrId: string, signedBy: string): Promise<Correspondence> {
    const corr = await this.correspondenceRepo.findOne({ where: { CorrespondenceID: corrId } as any });
    if (!corr) throw new NotFoundException('Correspondence not found');

    corr.SignedBy = signedBy;
    return this.correspondenceRepo.save(corr);
  }

  async dispatchCorrespondence(corrId: string, dispatchDate: Date): Promise<Correspondence> {
    const corr = await this.correspondenceRepo.findOne({ where: { CorrespondenceID: corrId } as any });
    if (!corr) throw new NotFoundException('Correspondence not found');

    corr.DispatchedDate = dispatchDate;
    return this.correspondenceRepo.save(corr);
  }

  async recordAcknowledgment(corrId: string, ackDate: Date): Promise<Correspondence> {
    const corr = await this.correspondenceRepo.findOne({ where: { CorrespondenceID: corrId } as any });
    if (!corr) throw new NotFoundException('Correspondence not found');

    corr.AcknowledgedDate = ackDate;
    return this.correspondenceRepo.save(corr);
  }

  async findByProject(projectId: string): Promise<Correspondence[]> {
    return this.correspondenceRepo.find({ where: { ProjectID: projectId } as any });
  }

  async findByClient(clientId: string): Promise<Correspondence[]> {
    return this.correspondenceRepo.find({ where: { ClientID: clientId } as any });
  }

  async getDispatchRegister(projectId: string): Promise<any> {
    const records = await this.findByProject(projectId);
    return records.map(r => ({
      referenceNumber: r.ReferenceNumber,
      letterType: r.LetterType,
      dispatchedDate: r.DispatchedDate,
      acknowledgedDate: r.AcknowledgedDate,
    }));
  }

  async getLetterHistory(corrId: string): Promise<any> {
    const corr = await this.correspondenceRepo.findOne({ where: { CorrespondenceID: corrId } as any });
    if (!corr) throw new NotFoundException('Correspondence not found');
    return [
      { status: 'DRAFT', date: new Date() },
      ...(corr.SignedBy ? [{ status: 'SIGNED', by: corr.SignedBy }] : []),
      ...(corr.DispatchedDate ? [{ status: 'DISPATCHED', date: corr.DispatchedDate }] : []),
      ...(corr.AcknowledgedDate ? [{ status: 'ACKNOWLEDGED', date: corr.AcknowledgedDate }] : []),
    ];
  }
}
