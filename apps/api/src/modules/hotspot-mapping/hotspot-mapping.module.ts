import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotspotMappingService } from './hotspot-mapping.service';
import { HotspotMappingController } from './hotspot-mapping.controller';
import { Hotspot } from './entities/hotspot.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Hotspot])],
    providers: [HotspotMappingService],
    controllers: [HotspotMappingController],
    exports: [HotspotMappingService]
})
export class HotspotMappingModule {}
