import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsPositive,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRiceTypeDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  code: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  price: number;

  @IsBoolean()
  enable: boolean;
}

export class UpdateRiceTypeDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  code?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsBoolean()
  enable?: boolean;
}
