import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Producer } from './producer.entity';
import { Exclude, Type } from 'class-transformer';

@Entity()
export class TransactionReference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transactionCode: string; // Ej: "liquidación", "nota de crédito", "nota de débito"

  // Relación: referencia al productor involucrado
  @ManyToOne(() => Producer, { eager: true })
  @Type(() => Producer)
  producer: Producer;

  @Column()
  parentId: number; // ID de la transacción principal

  @Column()
  childId: number; // ID de la transacción relacionada

  @Column()
  parentType: string; // Tipo de entidad del padre (ej. "liquidación" o "anticipo")

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  @Exclude() // 👈 Esto lo excluye de la respuesta serializada
  deletedAt: Date;
}
