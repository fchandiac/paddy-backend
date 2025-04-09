import { IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecordDto {
  @Type(() => Number) // ← para asegurarse que se transforme si viene como string
  @IsNumber()
  userId: number;

  @IsString()
  entity: string;

  @IsString()
  description: string;
}
