import { IsNumber, IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { TransactionTypeCode } from 'libs/enums';

export class CreateDiscountTransactionDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  producerId: number;

  @IsNumber()
  debit: number;

  @IsNumber()
  credit: number;

  @IsString()
  description: string;

  @IsNumber()
  previousBalance: number;

  @IsNumber()
  balance: number;

  @IsOptional()
  isDraft?: boolean;

  @IsObject()
  details: {
    productId: number;
    discountPercent: number;
    discountAmount: number;
    reason?: string;
    reference?: string;
    observations?: string;
  };
}
