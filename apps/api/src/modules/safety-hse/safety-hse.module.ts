import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SafetyHseService } from './safety-hse.service';
import { SafetyHseController } from './safety-hse.controller';
import { SafetyIncident } from './entities/safety-incident.entity';
import { SafetyAudit } from './entities/safety-audit.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SafetyIncident, SafetyAudit])],
    providers: [SafetyHseService],
    controllers: [SafetyHseController],
    exports: [SafetyHseService]
})
export class SafetyHseModule {}
