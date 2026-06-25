import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';
import type { Mock } from 'vitest';
import {
  InsufficientFundsException,
  TransactionAlreadyReversedException,
  SelfTransferException,
} from '../common/exceptions/wallet.exceptions';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('WalletService', () => {
  let service: WalletService;
  let prisma: DeepMockProxy<PrismaService>;

  const mockWallet = {
    id:        'wallet-1',
    userId:    'user-1',
    balance:   new Decimal(500),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReceiverWallet = {
    id:        'wallet-2',
    userId:    'user-2',
    balance:   new Decimal(100),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: PrismaService,  useValue: prisma },
        { provide: EventEmitter2,  useValue: { emit: vitest.fn() } },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  // ── DEPÓSITO ──────────────────────────────
  describe('deposit()', () => {
    it('deve somar ao saldo existente (happy path)', async () => {
      const txFn = vitest.fn(async (cb) => cb(prisma));
      (prisma.$transaction as Mock) = txFn;

      prisma.wallet.findUniqueOrThrow.mockResolvedValue(mockWallet);
      prisma.wallet.update.mockResolvedValue({ ...mockWallet, balance: new Decimal(600) });
      prisma.transaction.create.mockResolvedValue({
        id: 'tx-1', type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED, amount: new Decimal(100),
        description: null, senderWalletId: null, receiverWalletId: 'wallet-1',
        reversedFromId: null, createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.deposit('user-1', { amount: 100 });

      expect(result.balance.toString()).toBe('600');
      expect(prisma.wallet.update).toHaveBeenCalledTimes(1);
    });

    it('deve acrescentar ao saldo negativo', async () => {
      const walletNegative = { ...mockWallet, balance: new Decimal(-200) };
      const txFn = vitest.fn(async (cb) => cb(prisma));
      (prisma.$transaction as Mock) = txFn;

      prisma.wallet.findUniqueOrThrow.mockResolvedValue(walletNegative);
      prisma.wallet.update.mockResolvedValue({ ...walletNegative, balance: new Decimal(-100) });
      prisma.transaction.create.mockResolvedValue({} as any);

      const result = await service.deposit('user-1', { amount: 100 });

      expect(result.balance.toString()).toBe('-100');
    });
  });

  // ── TRANSFERÊNCIA ─────────────────────────
  describe('transfer()', () => {
    it('deve debitar do remetente e creditar o destinatário', async () => {
      const txFn = vitest.fn(async (cb) => cb(prisma));
      (prisma.$transaction as Mock) = txFn;

      prisma.wallet.findUniqueOrThrow
        .mockResolvedValueOnce(mockWallet)
        .mockResolvedValueOnce(mockReceiverWallet);
      prisma.wallet.update
        .mockResolvedValueOnce({ ...mockWallet, balance: new Decimal(400) })
        .mockResolvedValueOnce({ ...mockReceiverWallet, balance: new Decimal(200) });
      prisma.transaction.create.mockResolvedValue({} as any);

      const result = await service.transfer('user-1', {
        receiverUserId: 'user-2',
        amount: 100,
      });

      expect(result.balance.toString()).toBe('400');
    });

    it('deve lançar InsufficientFundsException quando saldo é menor que o valor', async () => {
      const txFn = vitest.fn(async (cb) => cb(prisma));
      (prisma.$transaction as Mock) = txFn;

      prisma.wallet.findUniqueOrThrow
        .mockResolvedValueOnce(mockWallet)         // saldo: 500
        .mockResolvedValueOnce(mockReceiverWallet);

      await expect(
        service.transfer('user-1', { receiverUserId: 'user-2', amount: 999 }),
      ).rejects.toThrow(InsufficientFundsException);
    });
  });

  // ── REVERSÃO ─────────────────────────────
  describe('reverse()', () => {
    const mockTransaction = {
      id:               'tx-original',
      type:             TransactionType.TRANSFER,
      status:           TransactionStatus.COMPLETED,
      amount:           new Decimal(100),
      description:      null,
      senderWalletId:   'wallet-1',
      receiverWalletId: 'wallet-2',
      reversedFromId:   null,
      createdAt:        new Date(),
      updatedAt:        new Date(),
      reversal:         null,
    };

    it('deve reverter uma transferência com sucesso', async () => {
      const txFn = vitest.fn(async (cb) => cb(prisma));
      (prisma.$transaction as Mock) = txFn;

      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);
      prisma.wallet.findUniqueOrThrow.mockResolvedValue(mockWallet);
      prisma.wallet.update.mockResolvedValue({} as any);
      prisma.transaction.update.mockResolvedValue({} as any);
      prisma.transaction.create.mockResolvedValue({ id: 'tx-reversal' } as any);

      const result = await service.reverse('user-1', 'tx-original');

      expect(result.reversalTransaction).toBeDefined();
      expect(prisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: TransactionStatus.REVERSED } }),
      );
    });

    it('deve lançar TransactionAlreadyReversedException para transação já revertida', async () => {
      const txFn = vitest.fn(async (cb) => cb(prisma));
      (prisma.$transaction as Mock) = txFn;

      prisma.transaction.findUnique.mockResolvedValue({
        ...mockTransaction,
        status:  TransactionStatus.REVERSED,
        reversal: {},
      } as any);
      prisma.wallet.findUniqueOrThrow.mockResolvedValue(mockWallet);

      await expect(
        service.reverse('user-1', 'tx-original'),
      ).rejects.toThrow(TransactionAlreadyReversedException);
    });
  });

  // ── AUTO-TRANSFERÊNCIA ────────────────────
  describe('transfer() — auto-transferência', () => {
    it('deve lançar SelfTransferException quando sender === receiver', async () => {
      await expect(
        service.transfer('user-1', { receiverUserId: 'user-1', amount: 100 }),
      ).rejects.toThrow('Não é possível transferir para sua própria conta');
    });
  });
});
