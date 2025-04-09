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

  // ✅ Relación a la transacción anterior (sin eager para evitar recursión infinita)
  @ManyToOne(() => Transaction, { nullable: true })
  lastTransaction: Transaction;

  // Marca si es una preliquidación
  @Column({ default: false })
  isDraft: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
