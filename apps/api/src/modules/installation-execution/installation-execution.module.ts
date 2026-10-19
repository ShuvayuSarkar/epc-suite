import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyDPR } from './entities/daily-dpr.entity';
import { JMCRecord } from './entities/jmc.entity';
import { Project } from '../../database/entities/project.entity';
import { InstallationExecutionService } from './installation-execution.service';
import { InstallationExecutionController } from './installation-execution.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DailyDPR, JMCRecord, Project])],
  controllers: [InstallationExecutionController],
  providers: [InstallationExecutionService],
  exports: [InstallationExecutionService],
})
export class InstallationExecutionModule {}
