import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MultiProjectTypeService } from './multi-project-type.service';
import { MultiProjectTypeController } from './multi-project-type.controller';
import { ProjectType } from '../../database/entities/project-type.entity';
import { ProjectTypeTemplate } from './entities/project-type-template.entity';
import { Project } from '../../database/entities/project.entity';
import { Client } from '../../database/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectType, ProjectTypeTemplate, Project, Client])],
  controllers: [MultiProjectTypeController],
  providers: [MultiProjectTypeService],
  exports: [MultiProjectTypeService],
})
export class MultiProjectTypeModule {}
