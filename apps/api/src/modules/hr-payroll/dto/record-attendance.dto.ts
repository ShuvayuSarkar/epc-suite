import { IsUUID, IsEnum, IsNotEmpty, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { AttendanceType, AttendanceSource } from '../entities/attendance-record.entity';

export class RecordAttendanceDto {
    @IsUUID()
    @IsNotEmpty()
    employeeId: string;

    @IsUUID()
    @IsOptional()
    projectId?: string;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsEnum(AttendanceType)
    @IsNotEmpty()
    attendanceType: AttendanceType;

    @IsEnum(AttendanceSource)
    @IsNotEmpty()
    source: AttendanceSource;

    @IsNumber()
    @IsOptional()
    gpsLat?: number;

    @IsNumber()
    @IsOptional()
    gpsLon?: number;
}
