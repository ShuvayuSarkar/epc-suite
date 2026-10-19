import { Controller, Post, Body, Param, Patch, Get, Query } from '@nestjs/common';
import { HrPayrollService } from './hr-payroll.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { RecordAttendanceDto } from './dto/record-attendance.dto';

@Controller('api/v1/hr')
export class HrPayrollController {
    constructor(private readonly hrService: HrPayrollService) {}

    @Post('employees')
    createEmployee(@Body() dto: CreateEmployeeDto) {
        return this.hrService.createEmployee(dto);
    }

    @Get('employees')
    findAll() {
        return this.hrService.findAll();
    }

    @Get('employees/:id')
    findById(@Param('id') id: string) {
        return this.hrService.findById(id);
    }

    @Patch('employees/:id')
    updateEmployee(@Param('id') id: string, @Body() data: any) {
        return this.hrService.updateEmployee(id, data);
    }

    @Post('attendance')
    recordAttendance(@Body() dto: RecordAttendanceDto) {
        return this.hrService.recordAttendance(dto);
    }

    @Get('attendance')
    getAttendance(@Query('employeeId') employeeId?: string, @Query('projectId') projectId?: string, @Query('date') date?: string) {
        if (employeeId) return this.hrService.getAttendanceByEmployee(employeeId);
        if (projectId) return this.hrService.getAttendanceByProject(projectId);
        if (date) return this.hrService.getAttendanceByDate(date);
        return [];
    }
}
