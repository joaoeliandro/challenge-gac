export class DepositCompletedEvent {
  static readonly NAME = 'transaction.deposit.completed';

  constructor(
    public readonly userId:        string,
    public readonly transactionId: string,
    public readonly amount:        number,
    public readonly newBalance:    string,
  ) {}
}

export class TransferCompletedEvent {
  static readonly NAME = 'transaction.transfer.completed';

  constructor(
    public readonly senderUserId:   string,
    public readonly receiverUserId: string,
    public readonly transactionId:  string,
    public readonly amount:         number,
    public readonly senderBalance:  string,
  ) {}
}

export class TransactionReversedEvent {
  static readonly NAME = 'transaction.reversed';

  constructor(
    public readonly userId:              string,
    public readonly originalTxId:        string,
    public readonly reversalTxId:        string,
    public readonly amount:              number,
  ) {}
}
