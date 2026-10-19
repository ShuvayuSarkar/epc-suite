import { IsEnum, IsDateString, IsNotEmpty } from 'class-validator';
import { ApprovalStatus } from '../entities/approval-checklist-item.entity';

export class UpdateApprovalDto {
    @IsEnum(ApprovalStatus)
    @IsNotEmpty()
    status: ApprovalStatus;

    @IsDateString()
    @IsNotEmpty()
    date: string;
}
