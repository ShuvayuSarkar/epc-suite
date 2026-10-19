import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLog } from './entities/request-log.entity';
import { RequestLogInterceptor } from './request-log.interceptor';
import { RequestLogController } from './request-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RequestLog])],
  providers: [RequestLogInterceptor],
  controllers: [RequestLogController],
  exports: [RequestLogInterceptor, TypeOrmModule],
})
export class RequestLogModule {}
