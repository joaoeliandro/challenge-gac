import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req     = context.switchToHttp().getRequest();
    const traceId = uuid();
    const { method, url, user } = req;
    const start = Date.now();

    req.traceId = traceId;

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          this.logger.log(`${method} ${url} — ${ms}ms`, {
            traceId,
            userId: user?.id,
            ms,
          });
        },
        error: (err) => {
          const ms = Date.now() - start;
          this.logger.warn(`${method} ${url} — ${ms}ms [ERRO: ${err.status}]`, {
            traceId,
            userId: user?.id,
            error: err.message,
          });
        },
      }),
    );
  }
}
