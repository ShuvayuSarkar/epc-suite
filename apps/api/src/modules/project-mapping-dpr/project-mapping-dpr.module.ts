import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMappingDprService } from './project-mapping-dpr.service';
import { ProjectMappingDprController } from './project-mapping-dpr.controller';
import { ProjectHealth } from './entities/project-health.entity';
import { ApprovalChecklistItem } from './entities/approval-checklist-item.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ProjectHealth, ApprovalChecklistItem])],
    providers: [ProjectMappingDprService],
    controllers: [ProjectMappingDprController],
    exports: [ProjectMappingDprService]
})
export class ProjectMappingDprModule {}
