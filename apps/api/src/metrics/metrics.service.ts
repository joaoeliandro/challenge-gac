import { Injectable, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  Registry,
  Counter,
  Histogram,
  collectDefaultMetrics,
} from 'prom-client';
import {
  DepositCompletedEvent,
  TransferCompletedEvent,
  TransactionReversedEvent,
} from '../wallet/events/transaction.events';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry = new Registry();

  private readonly transactionsTotal = new Counter({
    name:    'wallet_transactions_total',
    help:    'Total de transações por tipo e status',
    labelNames: ['type', 'status'],
    registers: [this.registry],
  });

  private readonly transactionAmountTotal = new Counter({
    name:    'wallet_transaction_amount_total',
    help:    'Soma dos valores movimentados por tipo de transação (em centavos)',
    labelNames: ['type'],
    registers: [this.registry],
  });

  readonly operationDuration = new Histogram({
    name:    'wallet_operation_duration_seconds',
    help:    'Duração das operações de carteira em segundos',
    labelNames: ['operation'],
    buckets:    [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [this.registry],
  });

  private readonly errorsTotal = new Counter({
    name:    'wallet_errors_total',
    help:    'Total de erros por tipo de operação e motivo',
    labelNames: ['operation', 'reason'],
    registers: [this.registry],
  });

  readonly httpRequestsTotal = new Counter({
    name:    'wallet_http_requests_total',
    help:    'Total de requisições HTTP por método, rota e status',
    labelNames: ['method', 'route', 'status'],
    registers: [this.registry],
  });

  readonly httpRequestDuration = new Histogram({
    name:    'wallet_http_request_duration_seconds',
    help:    'Duração das requisições HTTP em segundos',
    labelNames: ['method', 'route', 'status'],
    buckets:    [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
    registers: [this.registry],
  });

  onModuleInit() {
    collectDefaultMetrics({
      register: this.registry,
      prefix:   'wallet_nodejs_',
    });
  }

  @OnEvent(DepositCompletedEvent.NAME)
  onDepositCompleted(event: DepositCompletedEvent) {
    this.transactionsTotal.inc({ type: 'deposit', status: 'completed' });
    this.transactionAmountTotal.inc(
      { type: 'deposit' },
      Math.round(event.amount * 100),
    );
  }

  @OnEvent(TransferCompletedEvent.NAME)
  onTransferCompleted(event: TransferCompletedEvent) {
    this.transactionsTotal.inc({ type: 'transfer', status: 'completed' });
    this.transactionAmountTotal.inc(
      { type: 'transfer' },
      Math.round(event.amount * 100),
    );
  }

  @OnEvent(TransactionReversedEvent.NAME)
  onTransactionReversed(event: TransactionReversedEvent) {
    this.transactionsTotal.inc({ type: 'reversal', status: 'completed' });
    this.transactionAmountTotal.inc(
      { type: 'reversal' },
      Math.round(event.amount * 100),
    );
  }

  incrementError(operation: string, reason: string) {
    this.errorsTotal.inc({ operation, reason });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
