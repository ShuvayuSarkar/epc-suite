import { IsString, IsEnum, IsDateString } from 'class-validator';
import { PaymentMethod } from '../entities/bill.entity';

export class SchedulePaymentDto {
  @IsEnum(PaymentMethod)
  PaymentMethod: PaymentMethod;

  @IsDateString()
  PaymentDate: string;
}
