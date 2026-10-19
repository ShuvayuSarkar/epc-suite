import { IsUUID, IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { BillType } from '../entities/bill.entity';

export class ReceiveBillDto {
  @IsUUID()
  ProjectID: string;

  @IsEnum(BillType)
  BillType: BillType;

  @IsString()
  BillNumber: string;

  @IsString()
  @IsOptional()
  VendorName?: string;

  @IsString()
  @IsOptional()
  PONumber?: string;

  @IsNumber()
  GrossAmount: number;

  @IsNumber()
  @IsOptional()
  TDSAmount?: number;

  @IsNumber()
  @IsOptional()
  GSTAmount?: number;

  @IsNumber()
  NetAmount: number;

  @IsDateString()
  SubmittedDate: string;
}
