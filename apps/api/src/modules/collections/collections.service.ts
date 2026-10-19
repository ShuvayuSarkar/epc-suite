import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CollectionTarget } from './entities/collection-target.entity';
import { Project } from '../../database/entities/project.entity';
import { Client } from '../../database/entities/client.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { SetTargetDto } from './dto/set-target.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(CollectionTarget)
    private readonly targetRepo: Repository<CollectionTarget>,
  ) {}

  async createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = this.invoiceRepo.create({
      ...dto,
      status: 'BILLED',
      overdueDays: 0,
      escalationLevel: 'NONE',
    });
    return this.invoiceRepo.save(invoice);
  }

  async certifyInvoice(invoiceId: string, certDate: string): Promise<Invoice> {
    const inv = await this.invoiceRepo.findOne({ where: { invoiceId } });
    if (!inv) throw new NotFoundException('Invoice not found');
    inv.status = 'CERTIFIED';
    inv.certificationDate = new Date(certDate);
    return this.invoiceRepo.save(inv);
  }

  async recordPayment(invoiceId: string, dto: RecordPaymentDto): Promise<Invoice> {
    const inv = await this.invoiceRepo.findOne({ where: { invoiceId } });
    if (!inv) throw new NotFoundException('Invoice not found');
    
    inv.paymentAmount = Number(inv.paymentAmount) + Number(dto.amount);
    inv.paymentReceivedDate = new Date(dto.paymentDate);
    
    if (inv.paymentAmount >= inv.netAmount) {
      inv.status = 'PAID';
    } else {
      inv.status = 'PARTIALLY_PAID';
    }
    return this.invoiceRepo.save(inv);
  }

  async updateARAging(): Promise<void> {
    const invoices = await this.invoiceRepo.find({ where: { status: 'BILLED' } }); // Simplified
    const now = new Date();
    
    for (const inv of invoices) {
      if (inv.status !== 'PAID') {
        const diffTime = Math.abs(now.getTime() - inv.dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (now > inv.dueDate) {
          inv.status = 'OVERDUE';
          inv.overdueDays = diffDays;
          
          if (diffDays <= 30) inv.agingBucket = 'OVERDUE_0_30';
          else if (diffDays <= 60) inv.agingBucket = 'OVERDUE_30_60';
          else if (diffDays <= 90) inv.agingBucket = 'OVERDUE_60_90';
          else inv.agingBucket = 'OVERDUE_90_120_PLUS';
          
          await this.triggerEscalation(inv.invoiceId);
        } else {
          inv.agingBucket = 'CURRENT';
        }
        await this.invoiceRepo.save(inv);
      }
    }
  }

  async getARAgingReport(projectId: string): Promise<any> {
    const invoices = await this.invoiceRepo.find({ where: { projectId } });
    // logic to aggregate by bucket
    return {
      projectId,
      totalDue: invoices.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + Number(i.netAmount) - Number(i.paymentAmount), 0),
      invoices,
    };
  }

  async getARAgingByClient(clientId: string): Promise<any> {
    const invoices = await this.invoiceRepo.find({ where: { clientId } });
    return {
      clientId,
      totalDue: invoices.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + Number(i.netAmount) - Number(i.paymentAmount), 0),
    };
  }

  async getOverdueInvoices(projectId: string, thresholdDays: number): Promise<Invoice[]> {
    const invoices = await this.invoiceRepo.find({ where: { projectId, status: 'OVERDUE' } });
    return invoices.filter(i => i.overdueDays > thresholdDays);
  }

  async triggerEscalation(invoiceId: string): Promise<Invoice> {
    const inv = await this.invoiceRepo.findOne({ where: { invoiceId } });
    if (!inv) return inv;

    if (inv.overdueDays > 120) inv.escalationLevel = 'LEGAL';
    else if (inv.overdueDays > 90) inv.escalationLevel = 'CFO';
    else if (inv.overdueDays > 60) inv.escalationLevel = 'PD';
    else if (inv.overdueDays > 30) inv.escalationLevel = 'TEAM';
    
    return this.invoiceRepo.save(inv);
  }

  async setCollectionTarget(dto: SetTargetDto): Promise<CollectionTarget> {
    const target = this.targetRepo.create(dto);
    return this.targetRepo.save(target);
  }

  async getCollectionPerformance(projectId: string, month: string): Promise<any> {
    const targets = await this.targetRepo.find({ where: { projectId, targetMonth: month } });
    // calc performance
    return { targets };
  }

  async getRetentionTracker(projectId: string): Promise<any> {
    return this.invoiceRepo.find({ where: { projectId, invoiceType: 'RETENTION_RELEASE' } });
  }

  async getDLPLinkedBilling(projectId: string): Promise<any> {
    return { status: 'not implemented', projectId };
  }
}
