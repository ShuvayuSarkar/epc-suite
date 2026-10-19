import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoAmendmentService } from './po-amendment.service';
import { PoAmendmentController } from './po-amendment.controller';
import { POAmendment } from './entities/po-amendment.entity';
import { Project } from '../../database/entities/project.entity';
import { POLineItem } from '../../database/entities/po-line-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([POAmendment, Project, POLineItem])],
  controllers: [PoAmendmentController],
  providers: [PoAmendmentService],
  exports: [PoAmendmentService],
})
export class PoAmendmentModule {}
