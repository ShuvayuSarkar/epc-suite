import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../database/entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientMasterService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async createClient(dto: CreateClientDto): Promise<Client> {
    const client = this.clientRepository.create(dto as any);
    return this.clientRepository.save(client as any) as any;
  }

  async findAll(): Promise<Client[]> {
    return this.clientRepository.find();
  }

  async findById(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { ClientID: id } as any });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async findByShortName(shortName: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { ShortName: shortName } as any });
    if (!client) {
      throw new NotFoundException(`Client with short name ${shortName} not found`);
    }
    return client;
  }

  async updateClient(id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findById(id);
    Object.assign(client, dto);
    return this.clientRepository.save(client);
  }

  async getClientTerminology(clientId: string): Promise<{ awardDocumentType: string; referenceFormat: string }> {
    const client = await this.findById(clientId);
    return {
      awardDocumentType: client.AwardDocumentType,
      referenceFormat: client.ReferenceFormat,
    };
  }

  async getClientSLASet(clientId: string): Promise<any> {
    const client = await this.findById(clientId);
    return { defaultSlaSetId: client.DefaultSLASetID };
  }

  async getEmpanelledVendors(clientId: string): Promise<any> {
    const client = await this.findById(clientId);
    return { empanelledVendorListId: client.EmpanelledVendorListID };
  }
}
