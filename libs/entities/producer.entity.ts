import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Transaction } from './transaction.entity';
import { TransactionReference } from './transaction-reference.entity';

@Entity()
export class Producer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  businessName: string;

  @Column({ unique: true })
  rut: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @OneToMany(() => Transaction, (trx) => trx.producer)
  transactions: Transaction[];

  @OneToMany(() => TransactionReference, (ref) => ref.producer)
  transactionReferences: TransactionReference[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  @Exclude()
  deletedAt: Date;
}
