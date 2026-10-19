import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrespondenceService } from './correspondence.service';
import { CorrespondenceController } from './correspondence.controller';
import { Correspondence } from '../../database/entities/correspondence.entity';
import { Project } from '../../database/entities/project.entity';
import { Client } from '../../database/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Correspondence, Project, Client])],
  controllers: [CorrespondenceController],
  providers: [CorrespondenceService],
  exports: [CorrespondenceService],
})
export class CorrespondenceModule {}
