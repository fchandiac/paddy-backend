import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { AuditInterceptor, Audit } from '../../common/interceptors/audit.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
  FindByParamDto,
} from 'libs/dto/user.dto';

@Controller('users')
@UseInterceptors(AuditInterceptor)
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ✅ Verificar salud del servicio
  @Get('health')
  @Audit('VIEW', 'USER', 'Verificar salud del servicio de usuarios')
  healthCheck() {
    return this.userService.healthCheck();
  }

  // ✅ Crear usuario
  @Post()
  @Audit('CREATE', 'USER', 'Crear usuario')
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  // ✅ Listar todos los usuarios
  @Get()
  @Audit('VIEW', 'USER', 'Listar todos los usuarios')
  findAll() {
    return this.userService.findAll();
  }

  // ✅ Buscar usuario por ID
  @Get('id/:id')
  @Audit('VIEW', 'USER', 'Buscar usuario por ID')
  findById(@Param('id') id: string) {
    return this.userService.findById(Number(id));
  }

  // ✅ Buscar usuario por email
  @Get('email/:email')
  @Audit('VIEW', 'USER', 'Buscar usuario por email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  // ✅ Buscar usuario por nombre (parcial)
  @Get('name/:name')
  @Audit('VIEW', 'USER', 'Buscar usuario por nombre')
  findByName(@Param('name') name: string) {
    return this.userService.findByName(name);
  }

  // ✅ Actualizar usuario
  @Put()
  @Audit('UPDATE', 'USER', 'Actualizar usuario')
  updateUser(@Body() dto: UpdateUserDto) {
    return this.userService.updateUser(dto);
  }

  // ✅ Cambiar contraseña
  @Put('password')
  @Audit('UPDATE', 'USER', 'Actualizar contraseña de usuario')
  updatePassword(@Body() dto: UpdatePasswordDto) {
    return this.userService.updatePassword(dto);
  }

  // ✅ Eliminar usuario (soft delete)
  @Delete(':id')
  @Audit('DELETE', 'USER', 'Eliminar usuario')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(Number(id));
  }
}
