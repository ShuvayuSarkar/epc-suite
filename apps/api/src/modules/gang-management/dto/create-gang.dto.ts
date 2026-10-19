import { IsUUID, IsString, IsEnum, IsInt, IsOptional, IsNumber } from 'class-validator';
import { GangType, TerrainType } from '../entities/gang.entity';

export class CreateGangDto {
  @IsUUID()
  ProjectID: string;

  @IsString()
  GangName: string;

  @IsEnum(GangType)
  GangType: GangType;

  @IsUUID()
  @IsOptional()
  LineSegmentID?: string;

  @IsString()
  SupervisorName: string;

  @IsString()
  @IsOptional()
  SupervisorContact?: string;

  @IsInt()
  FitterCount: number;

  @IsInt()
  LaborCount: number;

  @IsInt()
  HelperCount: number;

  @IsInt()
  @IsOptional()
  RiggerCount?: number;

  @IsInt()
  @IsOptional()
  SplicerCount?: number;

  @IsEnum(TerrainType)
  @IsOptional()
  TerrainType?: TerrainType;

  @IsNumber()
  @IsOptional()
  TargetKmPerDay?: number;
}
