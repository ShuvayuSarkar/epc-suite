import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractManagementService } from './contract-management.service';
import { ContractManagementController } from './contract-management.controller';
import { Contract } from './entities/contract.entity';
import { Project } from '../../database/entities/project.entity';
import { Client } from '../../database/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Project, Client])],
  controllers: [ContractManagementController],
  providers: [ContractManagementService],
  exports: [ContractManagementService],
})
export class ContractManagementModule {}
