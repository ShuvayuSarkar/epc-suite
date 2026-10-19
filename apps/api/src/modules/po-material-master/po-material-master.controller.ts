import { Controller, Get, Post, Body, Patch, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { PoMaterialMasterService } from './po-material-master.service';
import { CreatePoLineItemDto } from './dto/create-po-line-item.dto';
import { UpdatePoLineItemDto } from './dto/update-po-line-item.dto';

@Controller('api/v1/po-line-items')
export class PoMaterialMasterController {
  constructor(private readonly poMaterialMasterService: PoMaterialMasterService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPoLineItemDto: CreatePoLineItemDto) {
    return this.poMaterialMasterService.createPOLineItem(createPoLineItemDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  bulkCreate(@Body('poNumber') poNumber: string, @Body('items') items: CreatePoLineItemDto[]) {
    return this.poMaterialMasterService.bulkCreatePOLineItems(poNumber, items);
  }

  @Get('by-po/:poNumber')
  findByPO(@Param('poNumber') poNumber: string) {
    return this.poMaterialMasterService.findByPO(poNumber);
  }

  @Get('by-project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.poMaterialMasterService.findByProject(projectId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePoLineItemDto: UpdatePoLineItemDto) {
    return this.poMaterialMasterService.updateLineItem(id, updatePoLineItemDto);
  }

  @Get('summary/:projectId')
  getSummary(@Param('projectId') projectId: string) {
    return this.poMaterialMasterService.getPOSummary(projectId);
  }
}
