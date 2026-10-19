import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WbsBaselineService } from './wbs-baseline.service';
import { WbsBaselineController } from './wbs-baseline.controller';
import { WBS } from '../../database/entities/wbs.entity';
import { Baseline } from '../../database/entities/baseline.entity';
import { Project } from '../../database/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WBS, Baseline, Project])],
  controllers: [WbsBaselineController],
  providers: [WbsBaselineService],
  exports: [WbsBaselineService],
})
export class WbsBaselineModule {}
