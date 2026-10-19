import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientPortalService } from './client-portal.service';
import { ClientPortalController } from './client-portal.controller';
import { Project } from '../../database/entities/project.entity';
import { Client } from '../../database/entities/client.entity';
import { Milestone } from '../../database/entities/milestone.entity';
import { EngineeringDocument } from '../../database/entities/engineering-document.entity';
import { RFI } from '../../database/entities/rfi.entity';
import { PunchListItem } from '../../database/entities/punch-list-item.entity';
import { Correspondence } from '../../database/entities/correspondence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Project, 
    Client, 
    Milestone, 
    EngineeringDocument, 
    RFI, 
    PunchListItem, 
    Correspondence
  ])],
  controllers: [ClientPortalController],
  providers: [ClientPortalService],
  exports: [ClientPortalService],
})
export class ClientPortalModule {}
