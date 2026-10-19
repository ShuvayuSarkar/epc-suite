import { IsUUID, IsEnum, IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { SafetyIncidentSeverity } from '../entities/safety-incident.entity';

export class ReportIncidentDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsString()
    @IsNotEmpty()
    incidentType: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsNumber()
    @IsOptional()
    gpsLat?: number;

    @IsNumber()
    @IsOptional()
    gpsLon?: number;

    @IsEnum(SafetyIncidentSeverity)
    @IsNotEmpty()
    severity: SafetyIncidentSeverity;

    @IsString()
    @IsNotEmpty()
    reportedBy: string;
}
