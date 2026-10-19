import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gang } from './entities/gang.entity';
import { GangEfficiency } from './entities/gang-efficiency.entity';
import { Project } from '../../database/entities/project.entity';
import { GangManagementService } from './gang-management.service';
import { GangManagementController } from './gang-management.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Gang, GangEfficiency, Project])],
  controllers: [GangManagementController],
  providers: [GangManagementService],
  exports: [GangManagementService],
})
export class GangManagementModule {}
