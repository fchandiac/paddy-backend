import { Season } from './season.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Producer } from './producer.entity';
import { TransactionTypeCode } from 'libs/enums';

/**
 * Entidad que representa las transacciones financieras del sistema.
 * 
 * Tipos de movimientos:
 * Código  | Tipo          | Traducción        | Descripción
 * --------|---------------|-------------------|------------------------------------------
 * 1       | ADVANCE       | Anticipo          | Pago anticipado antes de una operación completa.
 * 2       | SETTLEMENT    | Liquidación       | Liquidación de una operación o cuenta.
 * 3       | DRYING        | Secado            | Proceso de eliminación de la humedad de un producto para su conservación.
 * 4       | INTEREST      | Interés           | Cargo aplicado sobre el capital prestado o saldo pendiente.
 * 5       | CREDIT_NOTE   | Nota de crédito   | Documento que refleja un crédito a favor.
 * 6       | DEBIT_NOTE    | Nota de débito    | Documento que refleja un débito o cargo.
 * 7       | DISCOUNT      | Descuento         | Registro de un descuento aplicado a productos.
  /**
   * Para transacciones de tipo DISCOUNT:
   * - productId: ID del producto al que se aplica el descuento
   * - discountPercent: Porcentaje de descuento aplicado
   * - discountAmount: Monto descontado
   * - reason: Motivo del descuento
   * - reference: Referencia a documento o recepción
   * - observations: Observaciones adicionales
   * Ejemplo:
   *   {
   *     productId: 123,
   *     discountPercent: 5,
   *     discountAmount: 1000,
   *     reason: 'Promoción',
   *     reference: 'REC-2025-001',
   *     observations: 'Descuento por campaña de invierno'
   *   }
   */
@Entity()
export class Transaction {

  @PrimaryGeneratedColumn()
  id: number;


  @Column()
  typeCode: number;

  @ManyToOne(() => Producer, { eager: false })
  producer: Producer;
  @Column()
  producerId: number;

  @ManyToOne(() => Season, { nullable: true })
  season: Season;
  @Column({ nullable: true })
  seasonId: number;

  @ManyToOne(() => User, { eager: false })
  user: User;
  @Column()
  userId: number;

  @Column('decimal')
  amount: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', nullable: true })
  notes?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

