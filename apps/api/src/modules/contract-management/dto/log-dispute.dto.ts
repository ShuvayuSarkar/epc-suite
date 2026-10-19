import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class LogDisputeDto {
  @IsString()
  @IsNotEmpty()
  disputeReference: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  raisedDate: string;

  @IsString()
  status: string;
}
