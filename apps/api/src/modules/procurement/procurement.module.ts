import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';
import { Vendor } from './entities/vendor.entity';
import { ProcurementOrder } from './entities/procurement-order.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Vendor, ProcurementOrder])],
    providers: [ProcurementService],
    controllers: [ProcurementController],
    exports: [ProcurementService]
})
export class ProcurementModule {}
