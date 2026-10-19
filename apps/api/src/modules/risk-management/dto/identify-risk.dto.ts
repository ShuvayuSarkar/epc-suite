import { IsUUID, IsString, IsOptional, IsDateString } from 'class-validator';

export class IdentifyRiskDto {
  @IsUUID()
  ProjectID: string;

  @IsUUID()
  @IsOptional()
  HotspotID?: string;

  @IsString()
  RiskCategory: string;

  @IsString()
  Description: string;

  @IsDateString()
  IdentifiedDate: string;

  @IsDateString()
  @IsOptional()
  TargetClosureDate?: string;
}
