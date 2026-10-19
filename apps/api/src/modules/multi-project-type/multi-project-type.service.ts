import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectType } from '../../database/entities/project-type.entity';
import { ProjectTypeTemplate } from './entities/project-type-template.entity';
import { Project } from '../../database/entities/project.entity';
import { Client } from '../../database/entities/client.entity';
import { CreateProjectTypeDto } from './dto/create-project-type.dto';
import { InstantiateProjectDto } from './dto/instantiate-project.dto';

@Injectable()
export class MultiProjectTypeService {
  constructor(
    @InjectRepository(ProjectType)
    private readonly projectTypeRepo: Repository<ProjectType>,
    @InjectRepository(ProjectTypeTemplate)
    private readonly templateRepo: Repository<ProjectTypeTemplate>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  async createProjectType(dto: CreateProjectTypeDto): Promise<ProjectType> {
    const pt = this.projectTypeRepo.create(dto as any);
    return this.projectTypeRepo.save(pt as any) as any;
  }

  async createTemplate(projectTypeId: string, templateData: any): Promise<ProjectTypeTemplate> {
    const template = this.templateRepo.create({
      projectTypeId,
      ...templateData,
      version: 1,
      isActive: true,
    } as any);
    return this.templateRepo.save(template as any) as any;
  }

  async updateTemplate(templateId: string, updates: any): Promise<ProjectTypeTemplate> {
    const template = await this.templateRepo.findOne({ where: { templateId } as any });
    if (!template) throw new NotFoundException('Template not found');
    
    Object.assign(template, updates);
    return this.templateRepo.save(template);
  }

  async instantiateProject(dto: InstantiateProjectDto): Promise<Project> {
    const client = await this.clientRepo.findOne({ where: { ClientID: dto.clientId } as any });
    if (!client) throw new NotFoundException('Client not found');

    const pt = await this.projectTypeRepo.findOne({ where: { Code: dto.projectTypeCode as any } as any });
    if (!pt) throw new NotFoundException('Project Type not found');

    const project = this.projectRepo.create({
      ClientID: client.ClientID,
      ProjectTypeID: pt.ProjectTypeID,
      CurrentStage: 'S0_BIDDING' as any,
      CurrentSubState: 'Draft',
      BidID: `BID-${Date.now()}`,
    } as any);
    return this.projectRepo.save(project as any) as any;
  }

  async getAvailableTypes(): Promise<ProjectType[]> {
    return this.projectTypeRepo.find();
  }

  async getTemplateForType(projectTypeCode: string): Promise<ProjectTypeTemplate> {
    const pt = await this.projectTypeRepo.findOne({ where: { Code: projectTypeCode as any } as any });
    if (!pt) throw new NotFoundException('Project Type not found');

    const template = await this.templateRepo.findOne({
      where: { projectTypeId: pt.ProjectTypeID, isActive: true } as any,
      order: { version: 'DESC' } as any,
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }
}
