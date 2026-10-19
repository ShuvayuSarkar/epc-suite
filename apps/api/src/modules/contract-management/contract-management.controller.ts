import { Controller, Get, Post, Body, Patch, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ContractManagementService } from './contract-management.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { LogDisputeDto } from './dto/log-dispute.dto';

@Controller('api/v1/contracts')
export class ContractManagementController {
  constructor(private readonly contractManagementService: ContractManagementService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractManagementService.createContract(createContractDto);
  }

  @Patch(':id/sign')
  sign(@Param('id') id: string, @Body('signedDate') signedDate: string) {
    return this.contractManagementService.signContract(id, signedDate);
  }

  @Post(':id/clauses')
  @HttpCode(HttpStatus.OK)
  extractClauses(@Param('id') id: string, @Body('clauses') clauses: any) {
    return this.contractManagementService.extractClauses(id, clauses);
  }

  @Patch(':id/compliance')
  updateCompliance(@Param('id') id: string, @Body('status') status: string) {
    return this.contractManagementService.updateComplianceStatus(id, status);
  }

  @Post(':id/disputes')
  @HttpCode(HttpStatus.CREATED)
  logDispute(@Param('id') id: string, @Body() logDisputeDto: LogDisputeDto) {
    return this.contractManagementService.logDispute(id, logDisputeDto);
  }

  @Get('by-project/:projectId')
  getByProject(@Param('projectId') projectId: string) {
    return this.contractManagementService.getContractByProject(projectId);
  }

  @Get('register')
  getRegister() {
    return this.contractManagementService.getContractRegister();
  }

  @Get('compliance-dashboard')
  getComplianceDashboard() {
    return this.contractManagementService.getComplianceDashboard();
  }
}
