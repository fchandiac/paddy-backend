import { IsNumber, IsOptional, IsString, IsEnum, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionTypeCode } from 'libs/enums';

export class CreateTransactionDto {
  @IsNumber()
  typeCode: number;

  @IsNumber()
  producerId: number;

  @IsNumber()
  seasonId: number;


  @IsNumber()
  amount: number;

  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class FilterTransactionDto {
  @IsOptional()
  @IsNumber()
  seasonId?: number;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsNumber()
  producerId?: number;

  @IsOptional()
  @IsNumber()
  typeCode?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class TransactionIdDto {
  @IsNumber()
  @Type(() => Number)
  id: number;
}
