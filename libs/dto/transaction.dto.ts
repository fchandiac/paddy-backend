import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionTypeCode } from 'libs/enums';

export class CreateTransactionDto {
  @IsNumber()
  @Type(() => Number)
  userId: number;

  @IsNumber()
  @Type(() => Number)
  producerId: number;

  @IsEnum(TransactionTypeCode)
  typeCode: TransactionTypeCode;

  @IsNumber()
  @Type(() => Number)
  debit: number;

  @IsNumber()
  @Type(() => Number)
  credit: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lastTransaction?: number;

  @IsNumber()
  @Type(() => Number)
  previousBalance: number;

  @IsNumber()
  @Type(() => Number)
  balance: number;

  @IsOptional()
  isDraft?: boolean;
}

export class FilterTransactionDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  producerId?: number;

  @IsOptional()
  @IsEnum(TransactionTypeCode)
  typeCode?: TransactionTypeCode;

  @IsOptional()
  @IsString()
  description?: string;
}

export class TransactionIdDto {
  @IsNumber()
  @Type(() => Number)
  id: number;
}
