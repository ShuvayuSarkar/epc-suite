import { IsUUID, IsEnum, IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';
import { PunchListSeverity } from '../entities/punch-list-item.entity';

export class CreatePunchListItemDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(PunchListSeverity)
    @IsNotEmpty()
    severity: PunchListSeverity;

    @IsArray()
    @IsOptional()
    photos?: string[];

    @IsNumber()
    @IsOptional()
    gpsLat?: number;

    @IsNumber()
    @IsOptional()
    gpsLon?: number;
}
