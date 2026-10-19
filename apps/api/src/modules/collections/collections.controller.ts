import { Controller, Get, Post, Body, Patch, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { SetTargetDto } from './dto/set-target.dto';

@Controller('api/v1/collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post('invoices')
  @HttpCode(HttpStatus.CREATED)
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.collectionsService.createInvoice(dto);
  }

  @Patch('invoices/:id/certify')
  certify(@Param('id') id: string, @Body('certDate') certDate: string) {
    return this.collectionsService.certifyInvoice(id, certDate);
  }

  @Patch('invoices/:id/payment')
  recordPayment(@Param('id') id: string, @Body() dto: RecordPaymentDto) {
    return this.collectionsService.recordPayment(id, dto);
  }

  @Post('update-aging')
  @HttpCode(HttpStatus.OK)
  updateAging() {
    return this.collectionsService.updateARAging();
  }

  @Get('ar-aging/:projectId')
  getAging(@Param('projectId') projectId: string) {
    return this.collectionsService.getARAgingReport(projectId);
  }

  @Get('overdue/:projectId')
  getOverdue(@Param('projectId') projectId: string, @Query('threshold') threshold: number) {
    return this.collectionsService.getOverdueInvoices(projectId, threshold || 0);
  }

  @Get('escalate/:invoiceId')
  triggerEscalation(@Param('invoiceId') invoiceId: string) {
    return this.collectionsService.triggerEscalation(invoiceId);
  }

  @Post('targets')
  @HttpCode(HttpStatus.CREATED)
  setTarget(@Body() dto: SetTargetDto) {
    return this.collectionsService.setCollectionTarget(dto);
  }

  @Get('performance/:projectId')
  getPerformance(@Param('projectId') projectId: string, @Query('month') month: string) {
    return this.collectionsService.getCollectionPerformance(projectId, month);
  }

  @Get('retention/:projectId')
  getRetention(@Param('projectId') projectId: string) {
    return this.collectionsService.getRetentionTracker(projectId);
  }
}
