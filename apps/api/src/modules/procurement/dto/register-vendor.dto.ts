import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class RegisterVendorDto {
    @IsString()
    @IsNotEmpty()
    vendorName: string;

    @IsString()
    @IsNotEmpty()
    vendorCode: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsOptional()
    contactPerson?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsBoolean()
    @IsOptional()
    isEmpanelled?: boolean;
}
