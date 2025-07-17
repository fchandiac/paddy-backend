import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from 'libs/entities/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
} from 'libs/dto/user.dto';
import { RecordService } from '../record/record.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly recordService: RecordService, // Inyectar el servicio de registros
  ) {}

  // ✅ Método de verificación de salud del servicio
  async healthCheck(): Promise<{ status: string }> {
    return { status: 'User service is running' };
  }

  // ✅ Crear un nuevo usuario, validando duplicados por email
  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const user = this.userRepo.create({
      ...dto,
      pass: dto.pass || '1234',
    });

    const createdUser = await this.userRepo.save(user);

    // Sanitizar la contraseña antes de devolver
    const { pass, ...userWithoutPassword } = createdUser;
    return userWithoutPassword as User;
  }

  // ✅ Listar todos los usuarios
  async findAll(): Promise<User[]> {
    const users = await this.userRepo.find({
      where: { deletedAt: null }, // ✅ solo los no eliminados
      order: { createdAt: 'DESC' },
    });
    
    // Sanitizar contraseñas
    return users.map(user => {
      const { pass, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  // ✅ Buscar usuario por ID (usado como base en otros métodos)
  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con ID ${id}`);
    }
    
    // Sanitizar la contraseña antes de devolver
    const { pass, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  // ✅ Buscar usuario por email
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`No se encontró un usuario con el correo ${email}`);
    }
    
    // Sanitizar la contraseña antes de devolver
    const { pass, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  // ✅ Buscar usuarios por nombre (like case-insensitive)
  async findByName(name: string): Promise<User[]> {
    const users = await this.userRepo.find({
      where: { name: ILike(`%${name}%`) },
    });

    if (!users.length) {
      throw new NotFoundException(`No se encontraron usuarios con nombre parecido a "${name}"`);
    }

    // Sanitizar contraseñas
    return users.map(user => {
      const { pass, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }


  async updateUser(dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: dto.id } });
  
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${dto.id} no encontrado`);
    }
  
    // Solo se permite actualizar name y role
    user.name = dto.name;
    user.role = dto.role;
  
    const updatedUser = await this.userRepo.save(user);
    
    // Sanitizar la contraseña antes de devolver
    const { pass, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  // ✅ Actualizar contraseña (el usuario debe existir)
  async updatePassword(dto: UpdatePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${dto.userId} no encontrado`);
    }
    
    (user as any).pass = dto.newPassword;
    await this.userRepo.save(user);
    
    return { message: 'Contraseña actualizada correctamente' };
  }

  // ✅ Soft delete
  async deleteUser(id: number): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    await this.userRepo.softDelete(user.id);
    return { message: 'Usuario eliminado correctamente' };
  }
}
