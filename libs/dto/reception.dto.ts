import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ReceptionStatus } from '../entities/reception.entity';

export class CreateReceptionDto {
  @IsNumber()
  producerId: number;

  @IsNumber()
  riceTypeId: number;

  @IsNumber()
  price: number;

  @IsString()
  @IsNotEmpty()
  guide: string;

  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @IsNumber()
  grossWeight: number;

  @IsNumber()
  tare: number;

  @IsNumber()
  netWeight: number;

  // 🧪 Análisis de granos
  @IsNumber()
  humedad: number;

  @IsNumber()
  granosVerdes: number;

  @IsNumber()
  impurezas: number;

  @IsNumber()
  granosManchados: number;

  @IsNumber()
  hualcacho: number;

  @IsNumber()
  granosPelados: number;

  @IsNumber()
  granosYesosos: number;

  // ➕ Bonificación
  @IsNumber()
  bonificacion: number;

  // 🌡 Secado
  @IsNumber()
  secado: number;

  @IsEnum(['pending', 'settled', 'canceled'])
  status: ReceptionStatus;
}

export class UpdateReceptionDto extends CreateReceptionDto {}
