import { IsString, IsOptional, IsInt, IsUUID } from 'class-validator';

export class PrepareEotClaimDto {
    @IsUUID()
    delayEventId: string;

    @IsUUID()
    projectId: string;

    @IsString()
    @IsOptional()
    executiveSummary?: string;

    @IsString()
    @IsOptional()
    contractualClauses?: string;

    @IsInt()
    @IsOptional()
    timeImpactDays?: number;
}
