import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class RegisterAssetDto {
    @IsString()
    @IsNotEmpty()
    assetName: string;

    @IsString()
    @IsNotEmpty()
    assetType: string;

    @IsString()
    @IsOptional()
    serialNumber?: string;

    @IsString()
    @IsNotEmpty()
    currentLocation: string;

    @IsBoolean()
    isRented: boolean;

    @IsNumber()
    @IsOptional()
    rentalRate?: number;
}
