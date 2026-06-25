import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';
import {
  InsufficientFundsException,
  TransactionNotFoundException,
  TransactionAlreadyReversedException,
  CannotReverseOwnTransactionException,
  SelfTransferException,
  ReceiverNotFoundException,
} from '../common/exceptions/wallet.exceptions';
import {
  DepositCompletedEvent,
  TransferCompletedEvent,
  TransactionReversedEvent,
} from './events/transaction.events';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma:        PrismaService,
    private readonly eventEmitter:  EventEmitter2,
  ) {}

  async getBalance(userId: string) {
    const wallet = await this.prisma.wallet.findUniqueOrThrow({
      where: { userId },
    });
    return { balance: wallet.balance, walletId: wallet.id };
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const wallet = await this.prisma.wallet.findUniqueOrThrow({ where: { userId } });

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where: {
          OR: [
            { senderWalletId: wallet.id },
            { receiverWalletId: wallet.id },
          ],
        },
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * limit,
        take:    limit,
        include: {
          senderWallet:   { include: { user: { select: { id: true, name: true, email: true } } } },
          receiverWallet: { include: { user: { select: { id: true, name: true, email: true } } } },
          reversal: true,
        },
      }),
      this.prisma.transaction.count({
        where: {
          OR: [{ senderWalletId: wallet.id }, { receiverWalletId: wallet.id }],
        },
      }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async deposit(userId: string, dto: DepositDto) {
    this.logger.log('Iniciando depósito', { userId, amount: dto.amount });

    const result = await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUniqueOrThrow({ where: { userId } });

      const newBalance = new Decimal(wallet.balance.toString()).plus(dto.amount);

      const [updatedWallet, transaction] = await Promise.all([
        tx.wallet.update({
          where: { id: wallet.id },
          data:  { balance: newBalance },
        }),
        tx.transaction.create({
          data: {
            type:             TransactionType.DEPOSIT,
            status:           TransactionStatus.COMPLETED,
            amount:           dto.amount,
            description:      dto.description,
            receiverWalletId: wallet.id,
          },
        }),
      ]);

      return { transaction, balance: updatedWallet.balance };
    });

    this.eventEmitter.emit(
      DepositCompletedEvent.NAME,
      new DepositCompletedEvent(
        userId,
        result.transaction.id,
        dto.amount,
        result.balance.toString(),
      ),
    );

    this.logger.log('Depósito concluído', {
      userId,
      transactionId: result.transaction.id,
      newBalance:    result.balance,
    });

    return result;
  }

  async transfer(senderUserId: string, dto: TransferDto) {
    if (senderUserId === dto.receiverUserId) {
      throw new SelfTransferException();
    }

    this.logger.log('Iniciando transferência', {
      senderUserId,
      receiverUserId: dto.receiverUserId,
      amount: dto.amount,
    });

    const result = await this.prisma.$transaction(async (tx) => {
      const [senderWallet, receiverWallet] = await Promise.all([
        tx.wallet.findUniqueOrThrow({ where: { userId: senderUserId } }),
        tx.wallet.findUnique({ where: { userId: dto.receiverUserId } }),
      ]);

      if (!receiverWallet) {
        throw new ReceiverNotFoundException();
      }

      const senderBalance = new Decimal(senderWallet.balance.toString());
      const amount        = new Decimal(dto.amount);

      if (senderBalance.lessThan(amount)) {
        throw new InsufficientFundsException();
      }

      const [updatedSender, , transaction] = await Promise.all([
        tx.wallet.update({
          where: { id: senderWallet.id },
          data:  { balance: senderBalance.minus(amount) },
        }),
        tx.wallet.update({
          where: { id: receiverWallet.id },
          data:  { balance: { increment: amount } },
        }),
        tx.transaction.create({
          data: {
            type:             TransactionType.TRANSFER,
            status:           TransactionStatus.COMPLETED,
            amount:           dto.amount,
            description:      dto.description,
            senderWalletId:   senderWallet.id,
            receiverWalletId: receiverWallet.id,
          },
        }),
      ]);

      return { transaction, balance: updatedSender.balance };
    });

    this.eventEmitter.emit(
      TransferCompletedEvent.NAME,
      new TransferCompletedEvent(
        senderUserId,
        dto.receiverUserId,
        result.transaction.id,
        dto.amount,
        result.balance.toString(),
      ),
    );

    this.logger.log('Transferência concluída', { transactionId: result.transaction.id });

    return result;
  }

  async reverse(userId: string, transactionId: string) {
    this.logger.log('Iniciando reversão', { userId, transactionId });

    const result = await this.prisma.$transaction(async (tx) => {
      const original = await tx.transaction.findUnique({
        where:   { id: transactionId },
        include: { reversal: true },
      });

      if (!original) throw new TransactionNotFoundException();

      if (original.status === TransactionStatus.REVERSED || original.reversal) {
        throw new TransactionAlreadyReversedException();
      }

      const userWallet = await tx.wallet.findUniqueOrThrow({ where: { userId } });

      const isInvolved =
        original.senderWalletId   === userWallet.id ||
        original.receiverWalletId === userWallet.id;

      if (!isInvolved) throw new CannotReverseOwnTransactionException();

      if (original.type === TransactionType.DEPOSIT) {
        await tx.wallet.update({
          where: { id: original.receiverWalletId },
          data:  { balance: { decrement: original.amount } },
        });
      } else if (original.type === TransactionType.TRANSFER) {
        await Promise.all([
          tx.wallet.update({
            where: { id: original.senderWalletId! },
            data:  { balance: { increment: original.amount } },
          }),
          tx.wallet.update({
            where: { id: original.receiverWalletId },
            data:  { balance: { decrement: original.amount } },
          }),
        ]);
      }

      const [, reversalTransaction] = await Promise.all([
        tx.transaction.update({
          where: { id: original.id },
          data:  { status: TransactionStatus.REVERSED },
        }),
        tx.transaction.create({
          data: {
            type:             TransactionType.REVERSAL,
            status:           TransactionStatus.COMPLETED,
            amount:           original.amount,
            description:      `Reversão da transação ${original.id}`,
            senderWalletId:   original.senderWalletId,
            receiverWalletId: original.receiverWalletId,
            reversedFromId:   original.id,
          },
        }),
      ]);

      return { reversalTransaction, originalAmount: Number(original.amount) };
    });

    this.eventEmitter.emit(
      TransactionReversedEvent.NAME,
      new TransactionReversedEvent(
        userId,
        transactionId,
        result.reversalTransaction.id,
        result.originalAmount,
      ),
    );

    this.logger.log('Reversão concluída', { reversalId: result.reversalTransaction.id });

    return { reversalTransaction: result.reversalTransaction };
  }
}
