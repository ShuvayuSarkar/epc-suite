import { Controller, Get, Post, Body, Patch, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientMasterService } from './client-master.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('api/v1/clients')
export class ClientMasterController {
  constructor(private readonly clientMasterService: ClientMasterService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientMasterService.createClient(createClientDto);
  }

  @Get()
  findAll() {
    return this.clientMasterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientMasterService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientMasterService.updateClient(id, updateClientDto);
  }

  @Get(':id/terminology')
  getTerminology(@Param('id') id: string) {
    return this.clientMasterService.getClientTerminology(id);
  }

  @Get(':id/sla-set')
  getSlaSet(@Param('id') id: string) {
    return this.clientMasterService.getClientSLASet(id);
  }

  @Get(':id/vendors')
  getVendors(@Param('id') id: string) {
    return this.clientMasterService.getEmpanelledVendors(id);
  }
}
