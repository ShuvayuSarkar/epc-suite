import { IsString, IsNotEmpty } from 'class-validator';

export class RespondRfiDto {
    @IsString()
    @IsNotEmpty()
    response: string;
}
