import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Risk } from './entities/risk.entity';
import { Project } from '../../database/entities/project.entity';
import { RiskManagementService } from './risk-management.service';
import { RiskManagementController } from './risk-management.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Risk, Project])],
  controllers: [RiskManagementController],
  providers: [RiskManagementService],
  exports: [RiskManagementService],
})
export class RiskManagementModule {}
