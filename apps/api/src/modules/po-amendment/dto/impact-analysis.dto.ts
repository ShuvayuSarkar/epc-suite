import { IsNumber, IsString, IsOptional } from 'class-validator';

export class ImpactAnalysisDto {
  @IsNumber()
  cost: number;

  @IsNumber()
  timeDays: number;

  @IsString()
  @IsOptional()
  scope?: string;
}
