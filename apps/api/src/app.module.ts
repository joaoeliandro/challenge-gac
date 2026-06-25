import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WinstonModule } from 'nest-winston';
import { envSchema } from './common/config/env';
import { winstonConfig } from './common/logger/winston.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../../.env',
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EventEmitterModule.forRoot({
      ignoreErrors: false,
      wildcard: false,
    }),
    WinstonModule.forRoot(winstonConfig),
    PrismaModule,
    AuthModule,
    WalletModule,
    HealthModule,
    MetricsModule,
  ],
})
export class AppModule { }
