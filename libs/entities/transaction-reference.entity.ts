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

/**
 * Lógica de referencias:
 * - Las liquidaciones (settlements) tienen referencias a otras entidades.
 * - Estas referencias pueden ser anticipos (advances) y recepciones (receptions).
 * - Es decir, una liquidación puede estar asociada a uno o varios anticipos y/o recepciones.
 * - La relación se representa mediante los campos parentId (liquidación), childId (anticipo o recepción) y parentType.
 * - Esto permite rastrear qué anticipos y recepciones fueron liquidados en una operación.
 */
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
