import { IsUUID, IsEnum, IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { DelayEventType, DelayEventSource } from '../entities/delay-event.entity';

export class LogDelayEventDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsEnum(DelayEventType)
    @IsNotEmpty()
    eventType: DelayEventType;

    @IsEnum(DelayEventSource)
    @IsNotEmpty()
    source: DelayEventSource;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsDateString()
    @IsNotEmpty()
    eventDate: string;

    @IsString()
    @IsNotEmpty()
    loggedBy: string;
}
