import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const startTime = Date.now();

    // Log de request entrante (solo para endpoints importantes)
    if (this.shouldLogRequest(url)) {
      this.logger.log(`→ ${method} ${url} - ${ip} - ${userAgent}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          if (this.shouldLogRequest(url)) {
            this.logger.log(`← ${method} ${url} - ${duration}ms`);
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `← ${method} ${url} - ERROR ${error.status || 500} - ${duration}ms`,
          );
        },
      }),
    );
  }

  private shouldLogRequest(url: string): boolean {
    // No loguear requests estáticos o de health check
    const skipPaths = ['/favicon.ico', '/health', '/api/docs'];
    return !skipPaths.some((path) => url.startsWith(path));
  }
}
