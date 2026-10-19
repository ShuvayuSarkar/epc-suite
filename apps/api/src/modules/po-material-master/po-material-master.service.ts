import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { POLineItem } from '../../database/entities/po-line-item.entity';
import { Project } from '../../database/entities/project.entity';
import { CreatePoLineItemDto } from './dto/create-po-line-item.dto';
import { UpdatePoLineItemDto } from './dto/update-po-line-item.dto';

@Injectable()
export class PoMaterialMasterService {
  constructor(
    @InjectRepository(POLineItem)
    private readonly poLineItemRepository: Repository<POLineItem>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async createPOLineItem(dto: CreatePoLineItemDto): Promise<POLineItem> {
    const item = this.poLineItemRepository.create(dto as any);
    return this.poLineItemRepository.save(item as any) as any;
  }

  async bulkCreatePOLineItems(poNumber: string, items: CreatePoLineItemDto[]): Promise<POLineItem[]> {
    const entities = items.map(item => this.poLineItemRepository.create({ ...item, PONumber: poNumber } as any));
    return this.poLineItemRepository.save(entities as any) as any;
  }

  async findByPO(poNumber: string): Promise<POLineItem[]> {
    return this.poLineItemRepository.find({ where: { PONumber: poNumber } as any });
  }

  async findByProject(projectId: string): Promise<POLineItem[]> {
    return this.poLineItemRepository.find({ where: { ProjectID: projectId } as any });
  }

  async findByCategory(projectId: string, category: string): Promise<POLineItem[]> {
    return this.poLineItemRepository.find({ where: { ProjectID: projectId, Category: category } as any });
  }

  async updateLineItem(id: string, dto: UpdatePoLineItemDto): Promise<POLineItem> {
    const item = await this.poLineItemRepository.findOne({ where: { POLineItemID: id } as any });
    if (!item) {
      throw new NotFoundException(`PO Line Item with ID ${id} not found`);
    }
    Object.assign(item, dto);
    return this.poLineItemRepository.save(item);
  }

  async updateReceiptDate(id: string, date: string): Promise<POLineItem> {
    return this.updateLineItem(id, { receiptAtSiteDate: date });
  }

  async updateDispatchDate(id: string, date: string): Promise<POLineItem> {
    return this.updateLineItem(id, { exWorksDispatchDate: date });
  }

  async updateInspectionDate(id: string, date: string): Promise<POLineItem> {
    return this.updateLineItem(id, { inspectionDate: date });
  }

  async getPOSummary(projectId: string): Promise<any> {
    const items = await this.findByProject(projectId);
    
    const summary = items.reduce((acc: any, item: any) => {
      const cat = item.Category || item.category || 'General';
      const qty = Number(item.Quantity || item.quantity || 0);
      if (!acc[cat]) {
        acc[cat] = { totalQuantity: 0, receivedQuantity: 0 };
      }
      acc[cat].totalQuantity += qty;
      if (item.ReceiptAtSiteDate || item.receiptAtSiteDate) {
        acc[cat].receivedQuantity += qty;
      }
      return acc;
    }, {});
    
    return { projectId, summary };
  }
}
