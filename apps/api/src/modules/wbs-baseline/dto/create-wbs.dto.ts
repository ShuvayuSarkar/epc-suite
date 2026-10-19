import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum WBSType {
  CONTRACT = 'CONTRACT',
  PACKAGE = 'PACKAGE',
  LINE_SEGMENT = 'LINE_SEGMENT',
  SITE = 'SITE',
  ACTIVITY = 'ACTIVITY',
}

export class CreateWbsDto {
  @IsEnum(WBSType)
  type: WBSType;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  contractId?: string;
}
