import {
  IsUUID,
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsDateString,
  IsArray,
  IsBoolean
} from 'class-validator';

export class CreateSiteSurveyDto {
  @IsUUID()
  ProjectID: string;

  @IsUUID()
  @IsOptional()
  LineSegmentID?: string;

  @IsString()
  SurveyType: string;

  @IsNumber()
  @IsOptional()
  GPSLat?: number;

  @IsNumber()
  @IsOptional()
  GPSLon?: number;

  @IsString()
  @IsOptional()
  Findings?: string;

  @IsObject()
  @IsOptional()
  Measurements?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  SurveyorName?: string;

  @IsDateString()
  SurveyDate: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  PhotoIDs?: string[];

  @IsBoolean()
  @IsOptional()
  IsGPSTagged?: boolean;
}
