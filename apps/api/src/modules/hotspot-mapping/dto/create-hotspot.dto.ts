import { IsUUID, IsEnum, IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { HotspotType, HotspotSeverity } from '../entities/hotspot.entity';

export class CreateHotspotDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsUUID()
    @IsOptional()
    lineSegmentId?: string;

    @IsEnum(HotspotType)
    @IsNotEmpty()
    hotspotType: HotspotType;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    gpsLat: number;

    @IsNumber()
    @IsNotEmpty()
    gpsLon: number;

    @IsEnum(HotspotSeverity)
    @IsNotEmpty()
    severity: HotspotSeverity;

    @IsDateString()
    @IsNotEmpty()
    identifiedDate: string;

    @IsDateString()
    @IsOptional()
    targetResolutionDate?: string;
}
