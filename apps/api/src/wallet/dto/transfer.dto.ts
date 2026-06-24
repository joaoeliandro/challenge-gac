import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class TransferDto {
  @ApiProperty({ example: 'uuid-do-usuario-destino' })
  @IsUUID()
  receiverUserId: string;

  @ApiProperty({ example: 50.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'Pagamento do almoço', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
