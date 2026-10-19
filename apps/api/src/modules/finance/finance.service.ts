import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill, BillStatus, PaymentMethod } from './entities/bill.entity';
import { Budget } from './entities/budget.entity';
import { ReceiveBillDto } from './dto/receive-bill.dto';

interface ApprovalLevel {
  level: string;
  role: string;
}

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) {}

  async receiveBill(dto: ReceiveBillDto): Promise<Bill> {
    const bill = this.billRepository.create({
      ...dto,
      Status: BillStatus.RECEIVED
    });
    return this.billRepository.save(bill);
  }

  async technicalApproval(billId: string, approver: string): Promise<Bill> {
    const bill = await this.billRepository.findOne({ where: { BillID: billId } });
    if (!bill) throw new NotFoundException('Bill not found');

    if (bill.Status !== BillStatus.RECEIVED && bill.Status !== BillStatus.VALIDATED) {
      throw new BadRequestException('Bill is not in a valid state for technical approval');
    }

    bill.Status = BillStatus.TECH_APPROVED;
    bill.TechnicalApprover = approver;
    bill.TechnicalApprovalDate = new Date();

    return this.billRepository.save(bill);
  }

  getFinancialApprovalLevel(amount: number): ApprovalLevel {
    if (amount <= 500000) {
      return { level: 'L1', role: 'Finance Manager' };
    } else if (amount <= 2000000) {
      return { level: 'L2', role: 'CFO' };
    } else {
      return { level: 'L3', role: 'PD + CFO' };
    }
  }

  async financialApproval(billId: string, approver: string): Promise<Bill> {
    const bill = await this.billRepository.findOne({ where: { BillID: billId } });
    if (!bill) throw new NotFoundException('Bill not found');

    if (bill.Status !== BillStatus.TECH_APPROVED) {
      throw new BadRequestException('Bill must be technically approved first');
    }

    const requiredLevel = this.getFinancialApprovalLevel(Number(bill.NetAmount));
    // In a real app, verify `approver` role matches `requiredLevel.role`

    bill.Status = BillStatus.FIN_APPROVED;
    bill.FinancialApprover = approver;
    bill.FinancialApprovalDate = new Date();

    return this.billRepository.save(bill);
  }

  async schedulePayment(billId: string, method: PaymentMethod, date: string): Promise<Bill> {
    const bill = await this.billRepository.findOne({ where: { BillID: billId } });
    if (!bill) throw new NotFoundException('Bill not found');

    if (bill.Status !== BillStatus.FIN_APPROVED) {
      throw new BadRequestException('Bill must be financially approved first');
    }

    bill.Status = BillStatus.SCHEDULED;
    bill.PaymentMethod = method;
    bill.PaymentDate = new Date(date);

    return this.billRepository.save(bill);
  }

  async executePayment(billId: string, reference: string): Promise<Bill> {
    const bill = await this.billRepository.findOne({ where: { BillID: billId } });
    if (!bill) throw new NotFoundException('Bill not found');

    if (bill.Status !== BillStatus.SCHEDULED) {
      throw new BadRequestException('Bill is not scheduled for payment');
    }

    bill.Status = BillStatus.PAID;
    bill.PaymentReference = reference;

    return this.billRepository.save(bill);
  }

  async getBillRegister(projectId: string): Promise<Bill[]> {
    return this.billRepository.find({ where: { ProjectID: projectId } });
  }

  async getBudgetVsActual(projectId: string): Promise<Budget[]> {
    return this.budgetRepository.find({ where: { ProjectID: projectId } });
  }

  async getVendorAging(projectId: string): Promise<any[]> {
    // Requires a query calculating date diffs between Submission and Now for unpaid bills
    return [];
  }

  async getCashFlowReport(projectId: string): Promise<any> {
    // Dummy projection
    return { status: 'Projection ready' };
  }

  async getTDSReport(projectId: string, period: string): Promise<any> {
    const bills = await this.billRepository.find({ where: { ProjectID: projectId, Status: BillStatus.PAID } });
    const tdsTotal = bills.reduce((sum, b) => sum + Number(b.TDSAmount || 0), 0);
    return { period, totalTDS: tdsTotal };
  }

  async getGSTReturnData(projectId: string, period: string): Promise<any> {
    const bills = await this.billRepository.find({ where: { ProjectID: projectId, Status: BillStatus.PAID } });
    const gstTotal = bills.reduce((sum, b) => sum + Number(b.GSTAmount || 0), 0);
    return { period, totalGST: gstTotal };
  }

  async getEwayBillRegister(projectId: string): Promise<any[]> {
    return [];
  }

  async getCostHeadAnalysis(projectId: string): Promise<any> {
    return this.budgetRepository.find({ where: { ProjectID: projectId } });
  }
}
