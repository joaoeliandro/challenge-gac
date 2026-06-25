import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DepositCompletedEvent,
  TransferCompletedEvent,
  TransactionReversedEvent,
} from '../events/transaction.events';

@Injectable()
export class TransactionAuditListener {
  private readonly logger = new Logger('AuditLog');

  @OnEvent(DepositCompletedEvent.NAME)
  handleDepositCompleted(event: DepositCompletedEvent) {
    this.logger.log('DEPOSIT_COMPLETED', {
      event:         DepositCompletedEvent.NAME,
      userId:        event.userId,
      transactionId: event.transactionId,
      amount:        event.amount,
      newBalance:    event.newBalance,
      timestamp:     new Date().toISOString(),
    });
  }

  @OnEvent(TransferCompletedEvent.NAME)
  handleTransferCompleted(event: TransferCompletedEvent) {
    this.logger.log('TRANSFER_COMPLETED', {
      event:          TransferCompletedEvent.NAME,
      senderUserId:   event.senderUserId,
      receiverUserId: event.receiverUserId,
      transactionId:  event.transactionId,
      amount:         event.amount,
      senderBalance:  event.senderBalance,
      timestamp:      new Date().toISOString(),
    });
  }

  @OnEvent(TransactionReversedEvent.NAME)
  handleTransactionReversed(event: TransactionReversedEvent) {
    this.logger.log('TRANSACTION_REVERSED', {
      event:         TransactionReversedEvent.NAME,
      userId:        event.userId,
      originalTxId:  event.originalTxId,
      reversalTxId:  event.reversalTxId,
      amount:        event.amount,
      timestamp:     new Date().toISOString(),
    });
  }
}
