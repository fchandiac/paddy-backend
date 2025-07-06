import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export type AuditAction = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'VIEW' 
  | 'EXPORT' 
  | 'IMPORT';

export type AuditEntityType = 
  | 'USER' 
  | 'PRODUCER' 
  | 'RECEPTION' 
  | 'RICE_TYPE' 
  | 'TEMPLATE' 
  | 'TRANSACTION' 
  | 'DISCOUNT_PERCENT'
  | 'SYSTEM';

@Entity('audit_log')
@Index(['userId', 'createdAt']) // Índice para consultas por usuario y fecha
@Index(['entityType', 'entityId']) // Índice para consultas por entidad
@Index(['action', 'createdAt']) // Índice para consultas por acción
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  // Usuario que realizó la acción
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  // Información de la sesión/IP
  @Column({ length: 45, nullable: true }) // IPv6 compatible
  ipAddress: string;

  @Column({ length: 500, nullable: true })
  userAgent: string;

  // Detalles de la acción
  @Column({
    type: 'enum',
    enum: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'IMPORT'],
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: ['USER', 'PRODUCER', 'RECEPTION', 'RICE_TYPE', 'TEMPLATE', 'TRANSACTION', 'DISCOUNT_PERCENT', 'SYSTEM'],
  })
  entityType: AuditEntityType;

  @Column({ nullable: true })
  entityId: number;

  @Column({ length: 255 })
  description: string;

  // Datos adicionales en JSON
  @Column('json', { nullable: true })
  metadata: any;

  // Datos anteriores (para updates)
  @Column('json', { nullable: true })
  oldValues: any;

  // Datos nuevos (para creates/updates)
  @Column('json', { nullable: true })
  newValues: any;

  // Resultado de la operación
  @Column({ default: true })
  success: boolean;

  @Column({ length: 500, nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
