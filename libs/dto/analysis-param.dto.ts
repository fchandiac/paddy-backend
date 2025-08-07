import {
  IsNumber,
  IsPositive,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAnalysisParamDto {
  @Type(() => Number)
  @IsNumber()
  discountCode: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  start: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  end: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  percent: number;
}

export class UpdateAnalysisParamDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountCode?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  start?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  end?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'El porcentaje no puede ser menor que 0' })
  @Max(100, { message: 'El porcentaje no puede ser mayor que 100' })
  percent?: number;
}
