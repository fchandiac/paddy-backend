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
  
  @Entity()
  export class ReceptionCalculation {
    @PrimaryGeneratedColumn()
    id: number;
  
    // Relación: quién realizó el cálculo
    @ManyToOne(() => User)
    user: User;
  
    @Column()
    transactionId: number; // ID de la transacción asociada a la liquidación o preLiquidación
  
    @Column('decimal')
    paddyRicePrice: number; // Precio neto aplicado al paddy (arroz sin procesar)
  
    @Column('decimal')
    paddyRiceNet: number; // Valor neto obtenido del proceso de liquidación
  
    @Column('decimal')
    paddyRiceVAT: number; // IVA aplicado sobre el paddy
  
    @Column('decimal')
    totalPaymentDue: number; // Total a pagar sin incluir secado
  
    @Column('decimal')
    dryingPercentage: number; // Porcentaje aplicado al secado
  
    @Column('decimal')
    dryingValue: number; // Valor calculado como paddyRiceNet * dryingPercentage
  
    @Column('decimal')
    dryingVAT: number; // IVA aplicado sobre dryingValue
  
    @Column('decimal')
    totalInvoice: number; // Suma de dryingValue y dryingVAT
  
    @Column('decimal')
    netPayment: number; // Suma de totalPaymentDue y totalInvoice
  
    @Column({ default: 'Draft' }) // 'Draft' o 'Final'
    status: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @DeleteDateColumn()
    deletedAt: Date;
  }
  