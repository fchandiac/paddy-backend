import { IsEmail, IsString, IsOptional, IsNotEmpty, IsIn, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

const VALID_ROLES = ['administrador', 'contador', 'operador'] as const;



export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsOptional()
  pass?: string;

  @IsString({ message: 'El rol debe ser una cadena de texto' })
  @IsIn(VALID_ROLES, {
    message: `El rol debe ser uno de los siguientes: ${VALID_ROLES.join(', ')}`,
  })
  role: string;
}


export class UpdateUserDto {
  @Type(() => Number)
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  pass?: string;

  @IsString()
  @IsIn(VALID_ROLES)
  role: string;
}

export class UpdatePasswordDto {
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class FindByParamDto {
  @IsString()
  value: string;
}
