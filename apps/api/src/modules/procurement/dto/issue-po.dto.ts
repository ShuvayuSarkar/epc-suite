import { IsUUID, IsString, IsNotEmpty, IsDateString, IsNumber } from 'class-validator';

export class IssuePoDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsUUID()
    @IsNotEmpty()
    vendorId: string;

    @IsString()
    @IsNotEmpty()
    poNumber: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsDateString()
    @IsNotEmpty()
    orderDate: string;

    @IsNumber()
    @IsNotEmpty()
    totalValue: number;
}
