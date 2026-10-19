import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class LogVisitDto {
    @IsDateString()
    @IsNotEmpty()
    visitDate: string;

    @IsString()
    @IsNotEmpty()
    findings: string;
}
