import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Record {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true }) // Relación con la entidad User
  user: User; // Relación con el usuario que realizó la acción

  @Column()
  entity: string; // Nombre de la entidad o tabla relacionada

  @Column()
  description: string; // Descripción de la acción realizada

  @CreateDateColumn()
  createdAt: Date; // Fecha y hora en que se creó el registro
}
