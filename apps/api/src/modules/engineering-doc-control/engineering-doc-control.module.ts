import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EngineeringDocControlService } from './engineering-doc-control.service';
import { EngineeringDocControlController } from './engineering-doc-control.controller';
import { EngineeringDocument } from '../../database/entities/engineering-document.entity';
import { Project } from '../../database/entities/project.entity';
import { Client } from '../../database/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EngineeringDocument, Project, Client])],
  controllers: [EngineeringDocControlController],
  providers: [EngineeringDocControlService],
  exports: [EngineeringDocControlService],
})
export class EngineeringDocControlModule {}
