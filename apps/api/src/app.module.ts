import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { envSchema } from './common/config/env';
import { winstonConfig } from './common/logger/winston.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    WinstonModule.forRoot(winstonConfig),
    PrismaModule,
    AuthModule,
    WalletModule,
  ],
})
export class AppModule {}
