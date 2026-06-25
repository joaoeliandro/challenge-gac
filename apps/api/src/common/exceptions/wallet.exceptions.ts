import { BadRequestException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';

export class InsufficientFundsException extends UnprocessableEntityException {
  constructor() {
    super('Saldo insuficiente para realizar a transferência');
  }
}

export class TransactionNotFoundException extends NotFoundException {
  constructor() {
    super('Transação não encontrada');
  }
}

export class TransactionAlreadyReversedException extends BadRequestException {
  constructor() {
    super('Esta transação já foi revertida');
  }
}

export class CannotReverseOwnTransactionException extends BadRequestException {
  constructor() {
    super('Você não tem permissão para reverter esta transação');
  }
}

export class SelfTransferException extends BadRequestException {
  constructor() {
    super('Não é possível transferir para sua própria conta');
  }
}

export class ReceiverNotFoundException extends NotFoundException {
  constructor() {
    super('Destinatário não encontrado');
  }
}
