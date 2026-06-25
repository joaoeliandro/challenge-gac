import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  private metricsService?: {
    httpRequestsTotal:   { inc: (labels: object) => void };
    httpRequestDuration: { observe: (labels: object, value: number) => void };
  };

  setMetricsService(svc: any) {
    this.metricsService = svc;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req     = context.switchToHttp().getRequest();
    const res     = context.switchToHttp().getResponse();
    const traceId = uuid();
    const { method, url, user } = req;
    const start   = Date.now();

    const route = url
      .replace(/\/[0-9a-f-]{36}/g, '/:id')
      .replace(/\?.*/, '');

    req.traceId = traceId;

    return next.handle().pipe(
      tap({
        next: () => {
          const ms     = Date.now() - start;
          const status = res.statusCode.toString();

          this.logger.log(`${method} ${url} ${status} — ${ms}ms`, {
            traceId,
            userId: user?.id,
            ms,
          });

          this.metricsService?.httpRequestsTotal.inc({ method, route, status });
          this.metricsService?.httpRequestDuration.observe(
            { method, route, status },
            ms / 1000,
          );
        },
        error: (err) => {
          const ms     = Date.now() - start;
          const status = (err.status ?? 500).toString();

          this.logger.warn(`${method} ${url} ${status} — ${ms}ms`, {
            traceId,
            userId: user?.id,
            error:  err.message,
          });

          this.metricsService?.httpRequestsTotal.inc({ method, route, status });
          this.metricsService?.httpRequestDuration.observe(
            { method, route, status },
            ms / 1000,
          );
        },
      }),
    );
  }
}
