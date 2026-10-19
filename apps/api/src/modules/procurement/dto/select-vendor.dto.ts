import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class SelectVendorDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsUUID()
    @IsNotEmpty()
    vendorId: string;
}
