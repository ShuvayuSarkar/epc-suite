import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { Project } from '../../database/entities/project.entity';
import { Client } from '../../database/entities/client.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { LogDisputeDto } from './dto/log-dispute.dto';

@Injectable()
export class ContractManagementService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
  ) {}

  async createContract(dto: CreateContractDto): Promise<Contract> {
    const contract = this.contractRepo.create(dto);
    return this.contractRepo.save(contract);
  }

  async signContract(contractId: string, signedDate: string): Promise<Contract> {
    const contract = await this.contractRepo.findOne({ where: { contractId } });
    if (!contract) throw new NotFoundException('Contract not found');

    contract.status = 'ACTIVE';
    contract.signedDate = new Date(signedDate);
    return this.contractRepo.save(contract);
  }

  async extractClauses(contractId: string, clauses: any): Promise<Contract> {
    const contract = await this.contractRepo.findOne({ where: { contractId } });
    if (!contract) throw new NotFoundException('Contract not found');

    contract.clauses = clauses;
    return this.contractRepo.save(contract);
  }

  async updateComplianceStatus(contractId: string, status: string): Promise<Contract> {
    const contract = await this.contractRepo.findOne({ where: { contractId } });
    if (!contract) throw new NotFoundException('Contract not found');

    contract.complianceStatus = status;
    return this.contractRepo.save(contract);
  }

  async logDispute(contractId: string, dto: LogDisputeDto): Promise<Contract> {
    const contract = await this.contractRepo.findOne({ where: { contractId } });
    if (!contract) throw new NotFoundException('Contract not found');

    const log = contract.disputeLog || [];
    log.push(dto);
    contract.disputeLog = log;
    contract.status = 'DISPUTED';
    
    return this.contractRepo.save(contract);
  }

  async getContractByProject(projectId: string): Promise<Contract> {
    const contract = await this.contractRepo.findOne({ where: { projectId } });
    if (!contract) throw new NotFoundException('Contract not found for project');
    return contract;
  }

  async getContractRegister(): Promise<Contract[]> {
    return this.contractRepo.find();
  }

  async getComplianceDashboard(): Promise<any> {
    const contracts = await this.contractRepo.find();
    return {
      total: contracts.length,
      compliant: contracts.filter(c => c.complianceStatus === 'COMPLIANT').length,
      nonCompliant: contracts.filter(c => c.complianceStatus === 'NON_COMPLIANT').length,
      underReview: contracts.filter(c => c.complianceStatus === 'UNDER_REVIEW').length,
    };
  }

  async getLDClause(contractId: string): Promise<string | null> {
    const contract = await this.contractRepo.findOne({ where: { contractId } });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract.ldClauseReference;
  }

  async getCloseoutReport(contractId: string): Promise<any> {
    const contract = await this.contractRepo.findOne({ where: { contractId } });
    if (!contract) throw new NotFoundException('Contract not found');
    
    return {
      contractId: contract.contractId,
      status: contract.status,
      complianceStatus: contract.complianceStatus,
      openDisputes: (contract.disputeLog || []).filter(d => d.status !== 'RESOLVED').length,
      // other closeout logic here
    };
  }

  async getClauseReferenceIndex(contractId: string): Promise<any> {
    const contract = await this.contractRepo.findOne({ where: { contractId } });
    if (!contract) throw new NotFoundException('Contract not found');
    
    return contract.clauses || {};
  }
}
