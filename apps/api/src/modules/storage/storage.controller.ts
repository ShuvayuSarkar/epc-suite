import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('api/v1/storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('keys')
  getKeys() {
    return this.storageService.getAllKeys();
  }

  @Get('bulk')
  getBulk() {
    return this.storageService.bulkGet([]);
  }

  @Get(':key')
  getItem(@Param('key') key: string) {
    return this.storageService.getItem(key);
  }

  @Post(':key')
  setItem(@Param('key') key: string, @Body() body: any) {
    // Body can be wrapped or direct
    const data = body?.data !== undefined ? body.data : body;
    return this.storageService.setItem(key, data);
  }

  @Delete(':key')
  removeItem(@Param('key') key: string) {
    return this.storageService.removeItem(key);
  }
}
