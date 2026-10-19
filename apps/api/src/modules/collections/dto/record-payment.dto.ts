import { IsNumber, IsDateString } from 'class-validator';

export class RecordPaymentDto {
  @IsNumber()
  amount: number;

  @IsDateString()
  paymentDate: string;
}
