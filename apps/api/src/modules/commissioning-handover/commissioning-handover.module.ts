import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommissioningHandoverService } from './commissioning-handover.service';
import { CommissioningHandoverController } from './commissioning-handover.controller';
import { CommissioningMilestone } from './entities/commissioning-milestone.entity';
import { Handover } from './entities/handover.entity';
import { PunchListItem } from './entities/punch-list-item.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CommissioningMilestone, Handover, PunchListItem])],
    providers: [CommissioningHandoverService],
    controllers: [CommissioningHandoverController],
    exports: [CommissioningHandoverService]
})
export class CommissioningHandoverModule {}
