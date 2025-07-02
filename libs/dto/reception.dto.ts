import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
} from 'class-validator';
import { ReceptionStatus } from '../entities/reception.entity';
import { ReceptionHistory } from '../interfaces/reception-history.interface';

export class CreateReceptionDto {
  @IsNumber()
  producerId: number;

  @IsNumber()
  riceTypeId: number;

  @IsOptional()
  @IsNumber()
  templateId?: number;

  @IsNumber()
  price: number;

  @IsString()
  guide: string;

  @IsString()
  licensePlate: string;

  @IsNumber()
  grossWeight: number;

  @IsNumber()
  tare: number;

  @IsNumber()
  netWeight: number;

  @IsNumber()
  percentHumedad: number;

  @IsNumber()
  toleranceHumedad: number;

  @IsNumber()
  percentGranosVerdes: number;

  @IsNumber()
  toleranceGranosVerdes: number;

  @IsNumber()
  percentImpurezas: number;

  @IsNumber()
  toleranceImpurezas: number;

  @IsNumber()
  percentGranosManchados: number;

  @IsNumber()
  toleranceGranosManchados: number;

  @IsNumber()
  percentHualcacho: number;

  @IsNumber()
  toleranceHualcacho: number;

  @IsNumber()
  percentGranosPelados: number;

  @IsNumber()
  toleranceGranosPelados: number;

  @IsNumber()
  percentGranosYesosos: number;

  @IsNumber()
  toleranceGranosYesosos: number;

  @IsNumber()
  percentVano: number;

  @IsNumber()
  toleranceVano: number;

  @IsNumber()
  toleranceBonificacion: number;


  @IsNumber()
  percentSecado: number;

  @IsNumber()
  totalDiscount: number;

  @IsNumber()
  bonus: number;

  @IsNumber()
  paddyNet: number;

  @IsEnum(['pending', 'settled', 'canceled'])
  status: ReceptionStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateReceptionDto {
  @IsOptional()
  @IsNumber()
  producerId?: number;

  @IsOptional()
  @IsNumber()
  riceTypeId?: number;

  @IsOptional()
  @IsNumber()
  templateId?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  guide?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsNumber()
  grossWeight?: number;

  @IsOptional()
  @IsNumber()
  tare?: number;

  @IsOptional()
  @IsNumber()
  netWeight?: number;

  @IsOptional()
  @IsNumber()
  percentHumedad?: number;

  @IsOptional()
  @IsNumber()
  toleranceHumedad?: number;

  @IsOptional()
  @IsNumber()
  percentGranosVerdes?: number;

  @IsOptional()
  @IsNumber()
  toleranceGranosVerdes?: number;

  @IsOptional()
  @IsNumber()
  percentImpurezas?: number;

  @IsOptional()
  @IsNumber()
  toleranceImpurezas?: number;

  @IsOptional()
  @IsNumber()
  percentGranosManchados?: number;

  @IsOptional()
  @IsNumber()
  toleranceGranosManchados?: number;

  @IsOptional()
  @IsNumber()
  percentHualcacho?: number;

  @IsOptional()
  @IsNumber()
  toleranceHualcacho?: number;

  @IsOptional()
  @IsNumber()
  percentGranosPelados?: number;

  @IsOptional()
  @IsNumber()
  toleranceGranosPelados?: number;

  @IsOptional()
  @IsNumber()
  percentGranosYesosos?: number;

  @IsOptional()
  @IsNumber()
  toleranceGranosYesosos?: number;

  @IsOptional()
  @IsNumber()
  toleranceBonificacion?: number;

  @IsOptional()
  @IsNumber()
  percentSecado?: number;

  @IsOptional()
  @IsNumber()
  totalDiscount?: number;

  @IsOptional()
  @IsNumber()
  bonus?: number;

  @IsOptional()
  @IsNumber()
  paddyNet?: number;

  @IsOptional()
  @IsEnum(['pending', 'settled', 'canceled'])
  status?: ReceptionStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

// DTO para registrar un motivo de cambio al actualizar
export class UpdateReasonDto {
  @IsString()
  reason: string;
  
  @IsOptional()
  @IsString()
  changedBy?: string;
}
