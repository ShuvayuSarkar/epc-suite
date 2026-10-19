import {
  IsUUID,
  IsString,
  IsOptional,
  IsArray
} from 'class-validator';

export class CreateJmcDto {
  @IsUUID()
  ProjectID: string;

  @IsUUID()
  @IsOptional()
  LineSegmentID?: string;

  @IsString()
  JMCType: string;

  @IsString()
  @IsOptional()
  Remarks?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  AttachmentIDs?: string[];
}
