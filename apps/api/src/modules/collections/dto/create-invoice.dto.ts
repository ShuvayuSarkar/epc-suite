import { IsString, IsUUID, IsNumber, IsEnum, IsDateString, IsOptional } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  projectId: string;

  @IsUUID()
  clientId: string;

  @IsString()
  invoiceNumber: string;

  @IsEnum(['SUPPLY_80', 'SERVICE_20', 'MANDATORY_SPARES', 'RETENTION_RELEASE'])
  invoiceType: string;

  @IsString()
  @IsOptional()
  billReference?: string;

  @IsNumber()
  grossAmount: number;

  @IsNumber()
  @IsOptional()
  tdsDeducted?: number;

  @IsNumber()
  @IsOptional()
  gstAmount?: number;

  @IsNumber()
  netAmount: number;

  @IsDateString()
  invoiceDate: string;

  @IsDateString()
  dueDate: string;
}
