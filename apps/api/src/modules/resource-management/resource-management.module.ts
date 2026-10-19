import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceManagementService } from './resource-management.service';
import { ResourceManagementController } from './resource-management.controller';
import { Asset } from './entities/asset.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Asset])],
    providers: [ResourceManagementService],
    controllers: [ResourceManagementController],
    exports: [ResourceManagementService]
})
export class ResourceManagementModule {}
