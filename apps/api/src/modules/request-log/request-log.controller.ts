import { Controller, Get, Query, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestLog } from './entities/request-log.entity';

@Controller('api/admin/request-log')
export class RequestLogController {
  constructor(
    @InjectRepository(RequestLog)
    private readonly logRepo: Repository<RequestLog>,
  ) {}

  @Get()
  async getLogs(
    @Query('limit') limit = '200',
    @Query('userId') userId?: string,
    @Query('method') method?: string,
    @Query('path') path?: string,
  ) {
    const query = this.logRepo.createQueryBuilder('log')
      .orderBy('log.timestamp', 'DESC')
      .take(parseInt(limit, 10));

    if (userId) query.andWhere('log.user_id = :userId', { userId });
    if (method) query.andWhere('log.method = :method', { method });
    if (path) query.andWhere('log.path LIKE :path', { path: `%${path}%` });

    return query.getMany();
  }

  @Get('stats')
  async getStats() {
    const total = await this.logRepo.count();
    const today = await this.logRepo
      .createQueryBuilder('log')
      .where('log.timestamp >= :date', { date: new Date(new Date().setHours(0,0,0,0)) })
      .getCount();
    const byMethod = await this.logRepo
      .createQueryBuilder('log')
      .select('log.method', 'method')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.method')
      .getRawMany();
    return { total, today, byMethod };
  }

  @Delete('clear')
  async clearLogs() {
    await this.logRepo.clear();
    return { success: true };
  }
}
