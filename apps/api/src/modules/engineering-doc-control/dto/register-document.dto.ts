import { IsString, IsEnum, IsUUID, IsOptional, IsDateString } from 'class-validator';

export enum DocumentType {
  DRAWING = 'DRAWING',
  GTP = 'GTP',
  DRUM_SCHEDULE = 'DRUM_SCHEDULE',
  DRUM_PLANNING = 'DRUM_PLANNING',
  SAG_TENSION_CHART = 'SAG_TENSION_CHART',
  SURVEY_REPORT = 'SURVEY_REPORT',
  TYPE_TEST = 'TYPE_TEST',
  MQP = 'MQP',
  ITP = 'ITP',
  FAT_PROCEDURE = 'FAT_PROCEDURE',
}

export class RegisterDocumentDto {
  @IsUUID()
  projectId: string;

  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsString()
  @IsOptional()
  materialCategoryId?: string;
}
