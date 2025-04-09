import { IsEnum, IsNumber, IsUUID } from 'class-validator';

export class CreateReceptionCalculationDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  transactionId: string;

  @IsNumber()
  paddyRicePrice: number;

  @IsNumber()
  paddyRiceNet: number;

  @IsNumber()
  paddyRiceVAT: number;

  @IsNumber()
  totalPaymentDue: number;

  @IsNumber()
  dryingPercentage: number;

  @IsNumber()
  dryingValue: number;

  @IsNumber()
  dryingVAT: number;

  @IsNumber()
  totalInvoice: number;

  @IsNumber()
  netPayment: number;
}

export class UpdateReceptionCalculationDto {
  @IsNumber()
  dryingPercentage: number;

  @IsNumber()
  dryingValue: number;

  @IsNumber()
  dryingVAT: number;

  @IsNumber()
  totalInvoice: number;

  @IsNumber()
  netPayment: number;
}
