import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TransactionAuditListener } from './listeners/transaction-audit.listener';

@Module({
  controllers: [WalletController],
  providers:   [WalletService, TransactionAuditListener],
})
export class WalletModule {}
