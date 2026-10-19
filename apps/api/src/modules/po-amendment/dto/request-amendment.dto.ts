import { IsString, IsUUID, IsNumber, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class RequestAmendmentDto {
  @IsUUID()
  projectId: string;

  @IsString()
  originalPONumber: string;

  @IsEnum(['EOT_APPROVAL', 'SURVEY_FINDING', 'CHANGE_ORDER', 'RATE_REVISION', 'CONTRACTUAL'])
  triggerType: string;

  @IsString()
  @IsOptional()
  triggerReference?: string;
  
  @IsNumber()
  costImpact: number;
}
