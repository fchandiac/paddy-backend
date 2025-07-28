import { IsNumber, IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { TransactionTypeCode } from 'libs/enums';

export class CreateDiscountTransactionDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  producerId: number;

  @IsOptional()
  @IsString()
  notes?: string;

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
