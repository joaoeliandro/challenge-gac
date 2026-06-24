import {
  Controller, Post, Get, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiResponse, ApiQuery,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Consultar saldo' })
  getBalance(@CurrentUser() user: any) {
    return this.walletService.getBalance(user.id);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Histórico de transações' })
  @ApiQuery({ name: 'page',  required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTransactions(
    @CurrentUser() user: any,
    @Query('page')  page  = 1,
    @Query('limit') limit = 20,
  ) {
    return this.walletService.getTransactions(user.id, +page, +limit);
  }

  @Post('deposit')
  @ApiOperation({ summary: 'Depositar dinheiro' })
  @ApiResponse({ status: 201, description: 'Depósito realizado' })
  deposit(@CurrentUser() user: any, @Body() dto: DepositDto) {
    return this.walletService.deposit(user.id, dto);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transferir para outro usuário' })
  @ApiResponse({ status: 201, description: 'Transferência realizada' })
  @ApiResponse({ status: 422, description: 'Saldo insuficiente' })
  transfer(@CurrentUser() user: any, @Body() dto: TransferDto) {
    return this.walletService.transfer(user.id, dto);
  }

  @Post('reverse/:transactionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reverter uma transação' })
  @ApiResponse({ status: 200, description: 'Reversão realizada' })
  @ApiResponse({ status: 400, description: 'Transação já revertida' })
  reverse(@CurrentUser() user: any, @Param('transactionId') id: string) {
    return this.walletService.reverse(user.id, id);
  }
}
