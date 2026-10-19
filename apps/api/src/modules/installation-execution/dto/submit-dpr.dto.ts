import {
  IsUUID,
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
  IsObject,
  IsArray,
  IsBoolean
} from 'class-validator';

export class SubmitDprDto {
  @IsUUID()
  ProjectID: string;

  @IsUUID()
  @IsOptional()
  LineSegmentID?: string;

  @IsUUID()
  @IsOptional()
  GangID?: string;

  @IsDateString()
  ReportDate: string;

  @IsNumber()
  @IsOptional()
  KmInstalled?: number;

  @IsNumber()
  @IsOptional()
  ManpowerCount?: number;

  @IsNumber()
  @IsOptional()
  IdleTimeHours?: number;

  @IsString()
  @IsOptional()
  IdleTimeReason?: string;

  @IsString()
  @IsOptional()
  HotspotStatus?: string;

  @IsString()
  @IsOptional()
  WeatherCondition?: string;

  @IsNumber()
  @IsOptional()
  RFICount?: number;

  @IsNumber()
  GPSLat: number;

  @IsNumber()
  GPSLon: number;

  @IsBoolean()
  @IsOptional()
  IsGeofenced?: boolean;

  @IsObject()
  @IsOptional()
  SubActivities?: Record<string, unknown>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  PhotoIDs?: string[];
}
