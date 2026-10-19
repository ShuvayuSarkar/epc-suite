import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ReceiveGoodsDto } from './dto/receive-goods.dto';
import { IssueGoodsDto } from './dto/issue-goods.dto';

@Controller('api/v1/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('grn')
  async receiveGoods(@Body() dto: ReceiveGoodsDto) {
    return this.inventoryService.receiveGoods(dto);
  }

  @Patch('grn/:id/inspect')
  async inspectGoods(
    @Param('id') id: string,
    @Body('accepted') accepted: number,
    @Body('rejected') rejected: number,
    @Body('reason') reason?: string
  ) {
    return this.inventoryService.inspectGoods(id, accepted, rejected, reason);
  }

  @Post('issue')
  async issueFromStore(@Body() dto: IssueGoodsDto) {
    return this.inventoryService.issueFromStore(dto);
  }

  @Post('reconcile/:projectId')
  async reconcileInventory(@Param('projectId') projectId: string) {
    return this.inventoryService.reconcileInventory(projectId);
  }

  @Get('by-project/:projectId')
  async getInventoryByProject(@Param('projectId') projectId: string) {
    return this.inventoryService.getInventoryByProject(projectId);
  }

  @Get('by-store/:storeLocation')
  async getInventoryByStore(@Param('storeLocation') storeLocation: string) {
    return this.inventoryService.getInventoryByStore(storeLocation);
  }

  @Get('low-stock/:projectId')
  async getLowStockAlerts(@Param('projectId') projectId: string) {
    return this.inventoryService.getLowStockAlerts(projectId);
  }

  @Get('drums/:projectId')
  async getDrumWiseStock(@Param('projectId') projectId: string) {
    return this.inventoryService.getDrumWiseStock(projectId);
  }

  @Get('grn-register/:projectId')
  async getGRNRegister(@Param('projectId') projectId: string) {
    return this.inventoryService.getGRNRegister(projectId);
  }

  @Get('dashboard/:projectId')
  async getInventoryDashboard(@Param('projectId') projectId: string) {
    return this.inventoryService.getInventoryDashboard(projectId);
  }
}
