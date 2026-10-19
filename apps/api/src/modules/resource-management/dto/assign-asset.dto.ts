import { IsUUID, IsOptional } from 'class-validator';

export class AssignAssetDto {
    @IsUUID()
    @IsOptional()
    projectId?: string;

    @IsUUID()
    @IsOptional()
    gangId?: string;
}
