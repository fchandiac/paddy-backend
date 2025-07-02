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
 */
@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: false })
  user: User;

  @ManyToOne(() => Producer, { eager: false })
  producer: Producer;

  @Column({
    type: 'enum',
    enum: TransactionTypeCode,
  })
  typeCode: TransactionTypeCode;

  @Column('decimal')
  debit: number;

  @Column('decimal')
  credit: number;

  @Column()
  description: string;

  @Column('decimal')
  previousBalance: number;

  @Column('decimal')
  balance: number;

  @ManyToOne(() => Transaction, { nullable: true })
  lastTransaction: Transaction;

  @Column({ default: false })
  isDraft: boolean;

  @Column({ type: 'varchar', nullable: true })
  bank?: string;

  @Column({ type: 'varchar', nullable: true })
  accountNumber?: string;

  @Column({ type: 'varchar', nullable: true })
  accountType?: string;

  @Column({ type: 'varchar', nullable: true })
  document?: string;

  @Column({ type: 'date', nullable: true })
  documentDate?: Date;

  @Column({ type: 'varchar', nullable: true })
  paymentType?: string;

  /**
   * Campo para almacenar detalles específicos según el tipo de transacción (ADVANCE, SETTLEMENT, DRYING, INTEREST, etc.)
   * Este campo permite tener flexibilidad para guardar información particular de cada tipo sin crear múltiples tablas.
   * 
   * Ejemplos de contenido:
   * - Para ADVANCE (Anticipo): { receptions: [1, 2, 3], advanceRate: 0.7, ... }
   * - Para DRYING (Secado): { weight: 1000, moisturePercentage: 15.3, dryingRate: 0.05, ... }
   * - Para INTEREST (Interés): { rate: 0.12, days: 30, baseAmount: 1000000, ... }
   */
  @Column({ type: 'json', nullable: true })
  details?: any;

  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

