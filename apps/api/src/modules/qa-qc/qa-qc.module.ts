import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QaQcService } from './qa-qc.service';
import { QaQcController } from './qa-qc.controller';
import { Inspection } from './entities/inspection.entity';
import { NCR } from './entities/ncr.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Inspection, NCR])],
    providers: [QaQcService],
    controllers: [QaQcController],
    exports: [QaQcService]
})
export class QaQcModule {}
