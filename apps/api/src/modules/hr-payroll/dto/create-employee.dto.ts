import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional, IsArray } from 'class-validator';
import { EmploymentType } from '../entities/employee.entity';

export class CreateEmployeeDto {
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    employeeCode: string;

    @IsString()
    @IsNotEmpty()
    department: string;

    @IsString()
    @IsNotEmpty()
    designation: string;

    @IsEnum(EmploymentType)
    @IsNotEmpty()
    employmentType: EmploymentType;

    @IsDateString()
    @IsNotEmpty()
    joinDate: string;

    @IsArray()
    @IsOptional()
    skillSet?: string[];
}
