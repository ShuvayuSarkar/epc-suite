import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrPayrollService } from './hr-payroll.service';
import { HrPayrollController } from './hr-payroll.controller';
import { Employee } from './entities/employee.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Employee, AttendanceRecord])],
    providers: [HrPayrollService],
    controllers: [HrPayrollController],
    exports: [HrPayrollService]
})
export class HrPayrollModule {}
