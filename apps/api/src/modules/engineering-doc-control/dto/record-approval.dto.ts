import { IsEnum, IsString, IsOptional, IsDateString } from 'class-validator';

export enum ApprovalDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class RecordApprovalDto {
  @IsEnum(ApprovalDecision)
  decision: ApprovalDecision;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsDateString()
  @IsOptional()
  approvedDate?: string;
}
