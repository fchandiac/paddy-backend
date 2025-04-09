import { IsNumber, IsUUID } from 'class-validator';

export class CreateRicePriceDto {
  @IsUUID()
  riceTypeId: string;

  @IsNumber()
  price: number;
}
