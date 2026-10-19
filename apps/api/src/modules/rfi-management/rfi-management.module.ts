import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RfiManagementService } from './rfi-management.service';
import { RfiManagementController } from './rfi-management.controller';
import { RFI } from './entities/rfi.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RFI])],
    providers: [RfiManagementService],
    controllers: [RfiManagementController],
    exports: [RfiManagementService]
})
export class RfiManagementModule {}
