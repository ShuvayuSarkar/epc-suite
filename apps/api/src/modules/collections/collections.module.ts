import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { Invoice } from './entities/invoice.entity';
import { CollectionTarget } from './entities/collection-target.entity';
import { Project } from '../../database/entities/project.entity';
import { Client } from '../../database/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, CollectionTarget, Project, Client])],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
