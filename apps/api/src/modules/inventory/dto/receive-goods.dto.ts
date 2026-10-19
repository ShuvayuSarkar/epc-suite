import { IsUUID, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class ReceiveGoodsDto {
  @IsUUID()
  ProjectID: string;

  @IsString()
  PONumber: string;

  @IsString()
  MaterialCode: string;

  @IsString()
  MaterialDescription: string;

  @IsNumber()
  ReceivedQuantity: number;

  @IsString()
  StoreLocation: string;

  @IsString()
  ReceivedBy: string;

  @IsDateString()
  ReceivedDate: string;

  @IsString()
  @IsOptional()
  JVRReference?: string;

  @IsString()
  @IsOptional()
  BarcodeScanID?: string;

  @IsString()
  @IsOptional()
  RFIDTag?: string;

  @IsString()
  @IsOptional()
  DrumNumber?: string;
}
