import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestLog } from './entities/request-log.entity';

@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(RequestLog)
    private readonly logRepo: Repository<RequestLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.saveLog(req, context, start, true),
        error: () => this.saveLog(req, context, start, false),
      }),
    );
  }

  private async saveLog(req: any, context: ExecutionContext, start: number, success: boolean) {
    try {
      const res = context.switchToHttp().getResponse();
      const log = this.logRepo.create({
        method: req.method,
        path: req.url,
        user_id: req.user?.id || null,
        user_email: req.user?.email || null,
        user_role: req.user?.role || null,
        status_code: res.statusCode,
        duration_ms: Date.now() - start,
        ip: req.ip,
      });
      await this.logRepo.save(log);
    } catch {
      // Never let logging crash the request
    }
  }
}
