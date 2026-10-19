import { IsString, IsEnum, IsUUID, IsObject } from 'class-validator';

export enum BaselineType {
  CONTRACTUAL = 'CONTRACTUAL',
  ACCELERATED = 'ACCELERATED',
}

export class CreateBaselineDto {
  @IsUUID()
  projectId: string;

  @IsEnum(BaselineType)
  type: BaselineType;

  @IsObject()
  data: Record<string, any>; // WBS baseline data mapping nodes to dates, quantities, etc.
}
