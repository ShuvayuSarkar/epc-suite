import { IsUUID, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class ScheduleAuditDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsString()
    @IsNotEmpty()
    auditType: string;

    @IsDateString()
    @IsNotEmpty()
    auditDate: string;

    @IsString()
    @IsNotEmpty()
    auditorName: string;
}
