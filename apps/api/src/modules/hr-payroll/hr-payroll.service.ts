import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { RecordAttendanceDto } from './dto/record-attendance.dto';

@Injectable()
export class HrPayrollService {
    constructor(
        @InjectRepository(Employee)
        private employeeRepo: Repository<Employee>,
        @InjectRepository(AttendanceRecord)
        private attendanceRepo: Repository<AttendanceRecord>
    ) {}

    async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
        const employee = this.employeeRepo.create(dto);
        return this.employeeRepo.save(employee);
    }

    async findAll(): Promise<Employee[]> {
        return this.employeeRepo.find();
    }

    async findById(employeeId: string): Promise<Employee | null> {
        return this.employeeRepo.findOne({ where: { employeeId } });
    }

    async updateEmployee(employeeId: string, data: any): Promise<void> {
        await this.employeeRepo.update(employeeId, data);
    }

    async recordAttendance(dto: RecordAttendanceDto): Promise<AttendanceRecord> {
        const record = this.attendanceRepo.create(dto);
        return this.attendanceRepo.save(record);
    }

    async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
        return this.attendanceRepo.find({ where: { date: new Date(date) } });
    }

    async getAttendanceByEmployee(employeeId: string): Promise<AttendanceRecord[]> {
        return this.attendanceRepo.find({ where: { employeeId } });
    }

    async getAttendanceByProject(projectId: string): Promise<AttendanceRecord[]> {
        return this.attendanceRepo.find({ where: { projectId } });
    }

    async getMonthlyPayrollSummary(): Promise<any> { return {}; }
    async getPFESICompliance(): Promise<any> { return {}; }
    async getSkillMatrix(): Promise<any> { return {}; }
    async getManpowerPlan(): Promise<any> { return {}; }
}
