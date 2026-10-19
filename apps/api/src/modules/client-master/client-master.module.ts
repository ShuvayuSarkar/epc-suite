import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientMasterService } from './client-master.service';
import { ClientMasterController } from './client-master.controller';
import { Client } from '../../database/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  controllers: [ClientMasterController],
  providers: [ClientMasterService],
  exports: [ClientMasterService],
})
export class ClientMasterModule {}
