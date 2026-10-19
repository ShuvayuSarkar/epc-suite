import { Controller, Post, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { ReceiveBillDto } from './dto/receive-bill.dto';
import { SchedulePaymentDto } from './dto/schedule-payment.dto';
import { PaymentMethod } from './entities/bill.entity';

@Controller('api/v1/finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('bills')
  async receiveBill(@Body() dto: ReceiveBillDto) {
    return this.financeService.receiveBill(dto);
  }

  @Patch('bills/:id/tech-approve')
  async technicalApproval(
    @Param('id') id: string,
    @Body('approver') approver: string
  ) {
    return this.financeService.technicalApproval(id, approver);
  }

  @Patch('bills/:id/fin-approve')
  async financialApproval(
    @Param('id') id: string,
    @Body('approver') approver: string
  ) {
    return this.financeService.financialApproval(id, approver);
  }

  @Patch('bills/:id/schedule-payment')
  async schedulePayment(
    @Param('id') id: string,
    @Body() dto: SchedulePaymentDto
  ) {
    return this.financeService.schedulePayment(id, dto.PaymentMethod, dto.PaymentDate);
  }

  @Patch('bills/:id/execute-payment')
  async executePayment(
    @Param('id') id: string,
    @Body('reference') reference: string
  ) {
    return this.financeService.executePayment(id, reference);
  }

  @Get('bill-register/:projectId')
  async getBillRegister(@Param('projectId') projectId: string) {
    return this.financeService.getBillRegister(projectId);
  }

  @Get('budget-vs-actual/:projectId')
  async getBudgetVsActual(@Param('projectId') projectId: string) {
    return this.financeService.getBudgetVsActual(projectId);
  }

  @Get('vendor-aging/:projectId')
  async getVendorAging(@Param('projectId') projectId: string) {
    return this.financeService.getVendorAging(projectId);
  }

  @Get('cash-flow/:projectId')
  async getCashFlowReport(@Param('projectId') projectId: string) {
    return this.financeService.getCashFlowReport(projectId);
  }

  @Get('tds/:projectId')
  async getTDSReport(
    @Param('projectId') projectId: string,
    @Query('period') period: string
  ) {
    return this.financeService.getTDSReport(projectId, period);
  }

  @Get('gst/:projectId')
  async getGSTReturnData(
    @Param('projectId') projectId: string,
    @Query('period') period: string
  ) {
    return this.financeService.getGSTReturnData(projectId, period);
  }
}
