import { IsString, IsUUID, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateContractDto {
  @IsUUID()
  projectId: string;

  @IsUUID()
  clientId: string;

  @IsString()
  contractNumber: string;

  @IsString()
  contractType: string;

  @IsNumber()
  contractValue: number;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  ldClauseReference?: string;

  @IsNumber()
  @IsOptional()
  retentionPct?: number;

  @IsString()
  @IsOptional()
  paymentTerms?: string;
}
