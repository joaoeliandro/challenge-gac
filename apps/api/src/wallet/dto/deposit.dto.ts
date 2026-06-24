import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsOptional, MaxLength } from 'class-validator';

export class DepositDto {
  @ApiProperty({ example: 100.50, description: 'Valor a depositar (positivo)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'Depósito inicial', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
