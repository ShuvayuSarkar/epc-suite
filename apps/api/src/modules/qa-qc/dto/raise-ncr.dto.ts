import { IsUUID, IsEnum, IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { NcrSeverity } from '../entities/ncr.entity';

export class RaiseNcrDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsUUID()
    @IsOptional()
    inspectionId?: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(NcrSeverity)
    @IsNotEmpty()
    severity: NcrSeverity;

    @IsString()
    @IsOptional()
    responsibleParty?: string;

    @IsDateString()
    @IsOptional()
    targetDate?: string;
}
