import { IsUUID, IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateRfiDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsArray()
    @IsOptional()
    attachments?: string[];
}
