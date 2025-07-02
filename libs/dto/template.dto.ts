import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  producerId?: number;

  @IsOptional()
  @IsBoolean()
  useToleranceGroup: boolean;

  @IsOptional()
  @IsNumber()
  groupToleranceValue: number;

  @IsOptional()
  @IsBoolean()
  availableHumedad: boolean;
  @IsOptional()
  @IsNumber()
  percentHumedad: number;
  @IsOptional()
  @IsNumber()
  toleranceHumedad: number;

  @IsOptional()
  @IsBoolean()
  showToleranceHumedad: boolean;

  @IsOptional()
  @IsBoolean()
  groupToleranceHumedad: boolean;
  @IsOptional()
  @IsBoolean()
  availableGranosVerdes: boolean;
  @IsOptional()
  @IsNumber()
  percentGranosVerdes: number;
  @IsOptional()
  @IsNumber()
  toleranceGranosVerdes: number;
  @IsOptional()
  @IsOptional()
  @IsBoolean()
  showToleranceGranosVerdes: boolean;
  @IsOptional()
  @IsOptional()
  @IsBoolean()
  groupToleranceGranosVerdes: boolean;
  @IsOptional()
  @IsBoolean()
  availableImpurezas: boolean;
  @IsOptional()
  @IsNumber()
  percentImpurezas: number;
  @IsOptional()
  @IsNumber()
  toleranceImpurezas: number;

  @IsOptional()
  @IsBoolean()
  showToleranceImpurezas: boolean;

  @IsOptional()
  @IsBoolean()
  groupToleranceImpurezas: boolean;
  @IsOptional()
  @IsBoolean()
  availableGranosManchados: boolean;
  @IsOptional()
  @IsNumber()
  percentGranosManchados: number;
  @IsOptional()
  @IsNumber()
  toleranceGranosManchados: number;
  @IsOptional()
  @IsOptional()
  @IsBoolean()
  showToleranceGranosManchados: boolean;
  @IsOptional()
  @IsOptional()
  @IsBoolean()
  groupToleranceGranosManchados: boolean;
  @IsOptional()
  @IsBoolean()
  availableHualcacho: boolean;
  @IsOptional()
  @IsNumber()
  percentHualcacho: number;
  @IsOptional()
  @IsNumber()
  toleranceHualcacho: number;
  @IsOptional()
  @IsOptional()
  @IsBoolean()
  showToleranceHualcacho: boolean;
  @IsOptional()
  @IsOptional()
  @IsBoolean()
  groupToleranceHualcacho: boolean;
  @IsOptional()
  @IsBoolean()
  availableGranosPelados: boolean;
  @IsOptional()
  @IsNumber()
  percentGranosPelados: number;
  @IsOptional()
  @IsNumber()
  toleranceGranosPelados: number;

  @IsOptional()
  @IsBoolean()
  showToleranceGranosPelados: boolean;

  @IsOptional()
  @IsBoolean()
  groupToleranceGranosPelados: boolean;
  @IsOptional()
  @IsBoolean()
  availableGranosYesosos: boolean;
  @IsOptional()
  @IsNumber()
  percentGranosYesosos: number;
  @IsOptional()
  @IsNumber()
  toleranceGranosYesosos: number;

  @IsOptional()
  @IsBoolean()
  showToleranceGranosYesosos: boolean;

  @IsOptional()
  @IsBoolean()
  groupToleranceGranosYesosos: boolean;
  @IsOptional()
  @IsBoolean()
  availableVano: boolean;
  @IsOptional()
  @IsNumber()
  percentVano: number;
  @IsOptional()
  @IsNumber()
  toleranceVano: number;

  @IsOptional()
  @IsBoolean()
  showToleranceVano: boolean;

  @IsOptional()
  @IsBoolean()
  groupToleranceVano: boolean;
  @IsOptional()
  @IsBoolean()
  availableBonificacion: boolean;
  @IsOptional()
  @IsNumber()
  toleranceBonificacion: number;
  @IsOptional()
  @IsBoolean()
  availableSecado: boolean;
  @IsOptional()
  @IsNumber()
  percentSecado: number;
}
