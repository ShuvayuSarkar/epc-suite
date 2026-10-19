import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GRN, GRNStatus } from './entities/grn.entity';
import { InventoryItem, InventoryItemStatus } from './entities/inventory-item.entity';
import { ReceiveGoodsDto } from './dto/receive-goods.dto';
import { IssueGoodsDto } from './dto/issue-goods.dto';

export interface InventoryDashboard {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalQuantity: number;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(GRN)
    private grnRepository: Repository<GRN>,
    @InjectRepository(InventoryItem)
    private inventoryItemRepository: Repository<InventoryItem>,
  ) {}

  async receiveGoods(dto: ReceiveGoodsDto): Promise<GRN> {
    const grn = this.grnRepository.create(dto);
    return this.grnRepository.save(grn);
  }

  async inspectGoods(grnId: string, accepted: number, rejected: number, reason?: string): Promise<GRN> {
    const grn = await this.grnRepository.findOne({ where: { GRNID: grnId } });
    if (!grn) throw new NotFoundException(`GRN ${grnId} not found`);

    if (accepted + rejected !== Number(grn.ReceivedQuantity)) {
      throw new BadRequestException('Accepted and rejected quantities must equal total received');
    }

    grn.AcceptedQuantity = accepted;
    grn.RejectedQuantity = rejected;
    grn.RejectionReason = reason || null;
    grn.Status = GRNStatus.INSPECTED;
    
    await this.grnRepository.save(grn);

    // Update inventory item
    if (accepted > 0) {
      let item = await this.inventoryItemRepository.findOne({
        where: { ProjectID: grn.ProjectID, MaterialCode: grn.MaterialCode, StoreLocation: grn.StoreLocation }
      });

      if (!item) {
        item = this.inventoryItemRepository.create({
          ProjectID: grn.ProjectID,
          MaterialCode: grn.MaterialCode,
          MaterialDescription: grn.MaterialDescription,
          Category: 'GENERAL', // Can be refined
          StoreLocation: grn.StoreLocation,
          CurrentQuantity: accepted,
          DrumNumber: grn.DrumNumber,
        });
      } else {
        item.CurrentQuantity = Number(item.CurrentQuantity) + accepted;
      }
      
      this.updateStatus(item);
      await this.inventoryItemRepository.save(item);
    }

    return grn;
  }

  async issueFromStore(dto: IssueGoodsDto): Promise<InventoryItem> {
    const item = await this.inventoryItemRepository.findOne({ where: { InventoryItemID: dto.InventoryItemID } });
    if (!item) throw new NotFoundException(`Inventory item not found`);

    if (Number(item.CurrentQuantity) < dto.Quantity) {
      throw new BadRequestException('Insufficient quantity in stock');
    }

    item.CurrentQuantity = Number(item.CurrentQuantity) - dto.Quantity;
    this.updateStatus(item);
    
    return this.inventoryItemRepository.save(item);
  }

  async reconcileInventory(projectId: string): Promise<{ status: string }> {
    // In a real scenario, this would compare physical counts vs system counts
    return { status: 'Reconciliation process initiated' };
  }

  async getInventoryByProject(projectId: string): Promise<InventoryItem[]> {
    return this.inventoryItemRepository.find({ where: { ProjectID: projectId } });
  }

  async getInventoryByStore(storeLocation: string): Promise<InventoryItem[]> {
    return this.inventoryItemRepository.find({ where: { StoreLocation: storeLocation } });
  }

  async getLowStockAlerts(projectId: string): Promise<InventoryItem[]> {
    return this.inventoryItemRepository.find({ 
      where: { ProjectID: projectId, Status: InventoryItemStatus.LOW_STOCK } 
    });
  }

  async getDrumWiseStock(projectId: string): Promise<InventoryItem[]> {
    return this.inventoryItemRepository.createQueryBuilder('item')
      .where('item.ProjectID = :projectId', { projectId })
      .andWhere('item.DrumNumber IS NOT NULL')
      .getMany();
  }

  async getGRNRegister(projectId: string): Promise<GRN[]> {
    return this.grnRepository.find({ where: { ProjectID: projectId } });
  }

  async getIssueRegister(projectId: string): Promise<any[]> {
    // Requires an IssueRecord entity ideally, but for now returning a placeholder
    return [];
  }

  async getInventoryDashboard(projectId: string): Promise<InventoryDashboard> {
    const items = await this.getInventoryByProject(projectId);
    let lowStockItems = 0;
    let outOfStockItems = 0;
    let totalQuantity = 0;

    items.forEach(item => {
      totalQuantity += Number(item.CurrentQuantity);
      if (item.Status === InventoryItemStatus.LOW_STOCK) lowStockItems++;
      if (item.Status === InventoryItemStatus.OUT_OF_STOCK) outOfStockItems++;
    });

    return {
      totalItems: items.length,
      lowStockItems,
      outOfStockItems,
      totalQuantity
    };
  }

  private updateStatus(item: InventoryItem): void {
    const qty = Number(item.CurrentQuantity);
    if (qty === 0) {
      item.Status = InventoryItemStatus.OUT_OF_STOCK;
    } else if (item.ReorderLevel && qty <= Number(item.ReorderLevel)) {
      item.Status = InventoryItemStatus.LOW_STOCK;
    } else {
      item.Status = InventoryItemStatus.IN_STOCK;
    }
  }
}
