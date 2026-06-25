import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import { MetricsService } from './metrics.service';

@ApiTags('Observabilidade')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Métricas Prometheus (scrape endpoint)' })
  @ApiExcludeEndpoint()
  async getMetrics(@Res() res: Response) {
    const [metrics, contentType] = await Promise.all([
      this.metricsService.getMetrics(),
      Promise.resolve(this.metricsService.getContentType()),
    ]);

    res.setHeader('Content-Type', contentType);
    res.send(metrics);
  }
}
