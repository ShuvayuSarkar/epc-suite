import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoMaterialMasterService } from './po-material-master.service';
import { PoMaterialMasterController } from './po-material-master.controller';
import { POLineItem } from '../../database/entities/po-line-item.entity';
import { Project } from '../../database/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([POLineItem, Project])],
  controllers: [PoMaterialMasterController],
  providers: [PoMaterialMasterService],
  exports: [PoMaterialMasterService],
})
export class PoMaterialMasterModule {}
