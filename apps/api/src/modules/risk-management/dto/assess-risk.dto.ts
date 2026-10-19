import { IsNumber, IsIn } from 'class-validator';

export class AssessRiskDto {
  @IsNumber()
  @IsIn([1, 2, 3, 4])
  Probability: number;

  @IsNumber()
  @IsIn([1, 2, 3, 4])
  Impact: number;
}
