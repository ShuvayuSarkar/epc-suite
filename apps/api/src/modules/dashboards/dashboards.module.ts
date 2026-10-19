import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardsService } from './dashboards.service';
import { DashboardsController } from './dashboards.controller';
import { Project } from '../../database/entities/project.entity';
import { Milestone } from '../../database/entities/milestone.entity';
import { Baseline } from '../../database/entities/baseline.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Milestone, Baseline])],
  controllers: [DashboardsController],
  providers: [DashboardsService],
  exports: [DashboardsService],
})
export class DashboardsModule {}
