import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { BankCode, AccountTypeCode } from '../enums';

export class CreateProducerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{7,8}-[\dKk]$/, {
    message: 'El RUT debe tener un formato válido. Ej: 12345678-9 o 12345678-K',
  })
  rut: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateProducerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{7,8}-[\dKk]$/, {
    message: 'El RUT debe tener un formato válido. Ej: 12345678-9 o 12345678-K',
  })
  rut?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class FilterProducerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  rut?: string;

  @IsOptional()
  @IsString()
  businessName?: string;
}

export class CreateProducerWithBankDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{7,8}-[\dKk]$/, {
    message: 'El RUT debe tener un formato válido. Ej: 12345678-9 o 12345678-K',
  })
  rut: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(BankCode, {
    message: 'El código de banco debe ser uno de los valores válidos',
  })
  bankCode?: number;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsEnum(AccountTypeCode, {
    message: 'El código de tipo de cuenta debe ser uno de los valores válidos',
  })
  accountTypeCode?: number;

  @IsOptional()
  @IsString()
  holderName?: string;
}

export class AddBankAccountDto {
  @IsEnum(BankCode, {
    message: 'El código de banco debe ser uno de los valores válidos',
  })
  bankCode: number;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsEnum(AccountTypeCode, {
    message: 'El código de tipo de cuenta debe ser uno de los valores válidos',
  })
  accountTypeCode: number;

  @IsString()
  @IsNotEmpty()
  holderName: string;
}