import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  Length,
  Matches,
} from 'class-validator';

export class CreateProducerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\d{1,2}\.?\d{3}\.?\d{3}-[\dkK])$/, {
    message: 'El RUT debe tener un formato válido, por ejemplo: 12.345.678-9',
  })
  rut?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[9|2]\d{8}$/, {
    message:
      'Debe ser un número de 9 dígitos válido. Ej: 912345678 o 222345678',
  })
  phone: string;
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
  @Matches(/^(\d{1,2}\.?\d{3}\.?\d{3}-[\dkK])$/, {
    message: 'El RUT debe tener un formato válido, por ejemplo: 12.345.678-9',
  })
  rut?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[9|2]\d{8}$/, {
    message:
      'Debe ser un número de 9 dígitos válido. Ej: 912345678 o 222345678',
  })
  phone: string;
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
