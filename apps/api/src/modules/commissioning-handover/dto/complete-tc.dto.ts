import { IsUUID, IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { CommMilestoneType } from '../entities/commissioning-milestone.entity';

export class CompleteTcDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsEnum(CommMilestoneType)
    @IsNotEmpty()
    type: CommMilestoneType;

    @IsString()
    @IsOptional()
    certificateRef?: string;

    @IsString()
    @IsOptional()
    signedBy?: string;
}
