import { IsUUID, IsEnum, IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { InspectionType } from '../entities/inspection.entity';

export class ScheduleInspectionDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsEnum(InspectionType)
    @IsNotEmpty()
    inspectionType: InspectionType;

    @IsDateString()
    @IsNotEmpty()
    scheduledDate: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsUUID()
    @IsOptional()
    procurementOrderId?: string;
}
