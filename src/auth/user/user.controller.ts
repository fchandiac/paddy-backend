import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
  FindByParamDto,
} from 'libs/dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ✅ Verificar salud del servicio
  @Get('health')
  healthCheck() {
    return this.userService.healthCheck();
  }

  // ✅ Crear usuario
  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  // ✅ Listar todos los usuarios
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // ✅ Buscar usuario por ID
  @Get('id/:id')
  findById(@Param('id') id: string) {
    return this.userService.findById(Number(id));
  }

  // ✅ Buscar usuario por email
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  // ✅ Buscar usuario por nombre (parcial)
  @Get('name/:name')
  findByName(@Param('name') name: string) {
    return this.userService.findByName(name);
  }

  // ✅ Actualizar usuario
  @Put()
  updateUser(@Body() dto: UpdateUserDto) {
    return this.userService.updateUser(dto);
  }

  // ✅ Cambiar contraseña
  @Put('password')
  updatePassword(@Body() dto: UpdatePasswordDto) {
    return this.userService.updatePassword(dto);
  }

  // ✅ Eliminar usuario (soft delete)
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(Number(id));
  }
}
