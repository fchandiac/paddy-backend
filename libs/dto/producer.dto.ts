import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';

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
  @IsString()
  bank?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  accountType?: string;

  @IsOptional()
  @IsString()
  holderName?: string;
}

export class AddBankAccountDto {
  @IsString()
  @IsNotEmpty()
  bank: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  accountType: string;

  @IsString()
  @IsNotEmpty()
  holderName: string;
}