import { IsString, IsUUID, IsObject } from 'class-validator';

export class InstantiateProjectDto {
  @IsUUID()
  clientId: string;

  @IsString()
  projectTypeCode: string;

  @IsObject()
  awardData: Record<string, any>; // Basic project info to instantiate with
}
