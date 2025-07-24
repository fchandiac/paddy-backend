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
import { Template } from './template.entity';

@Entity()
export class Producer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  businessName?: string;

  @Column({ unique: true, length: 12})
  rut: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'json', nullable: true })
  bankAccounts?: {
    bankCode: number;           // Código del banco (100, 101, etc.)
    bankName: string;           // Nombre del banco
    accountNumber: string;      // Número de cuenta
    accountTypeCode: number;    // Código del tipo de cuenta (101, 102, etc.)
    accountTypeName: string;    // Nombre del tipo de cuenta
    holderName?: string;        // Nombre del titular (opcional)
  }[];

  @OneToMany(() => Transaction, (trx) => trx.producer)
  transactions: Transaction[];

  @OneToMany(() => TransactionReference, (ref) => ref.producer)
  transactionReferences: TransactionReference[];

  @OneToMany(() => Template, (template) => template.producer)
  templates: Template[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  @Exclude()
  deletedAt: Date;
}
