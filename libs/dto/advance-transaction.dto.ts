import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class AdvanceTransactionMetadataDto {
  @IsNumber()
  rate: number;

  @IsNumber()
  days: number;

  @IsNumber()
  baseAmount: number;

  @IsNumber()
  interestAmount: number;

  @IsBoolean()
  discounted: boolean;
}

export class CreateAdvanceTransactionDto {
  @IsNumber()
  typeCode: number; // Debe ser el código de ADVANCE

  @IsNumber()
  producerId: number;

  @IsNumber()
  seasonId: number;

  @IsNumber()
  userId: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  notes?: string;

  @IsOptional()
  metadata?: AdvanceTransactionMetadataDto;
}
