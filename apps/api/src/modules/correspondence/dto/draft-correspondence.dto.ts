import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';

export enum LetterType {
  TRANSMITTAL = 'TRANSMITTAL',
  LETTER = 'LETTER',
  NOTICE = 'NOTICE',
  MINUTES_OF_MEETING = 'MINUTES_OF_MEETING',
}

export class DraftCorrespondenceDto {
  @IsUUID()
  projectId: string;

  @IsUUID()
  clientId: string;

  @IsEnum(LetterType)
  letterType: LetterType;

  @IsString()
  subject: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsString()
  @IsOptional()
  draftedBy?: string;
}
