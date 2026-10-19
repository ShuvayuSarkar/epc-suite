import { IsString, IsNumber, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreatePoLineItemDto {
  @IsString()
  poNumber: string;

  @IsString()
  headerNumber: string;

  @IsString()
  schLine: string;

  @IsString()
  materialCode: string;

  @IsString()
  materialDescription: string;

  @IsNumber()
  quantity: number;

  @IsString()
  category: string;

  @IsDateString()
  @IsOptional()
  receiptAtSiteDate?: string;

  @IsDateString()
  @IsOptional()
  exWorksDispatchDate?: string;

  @IsDateString()
  @IsOptional()
  inspectionDate?: string;

  @IsString()
  orderUnit: string;

  @IsUUID()
  projectId: string;

  @IsUUID()
  @IsOptional()
  lineSegmentId?: string;
}
