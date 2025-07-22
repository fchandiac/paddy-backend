import { Season } from './season.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Producer } from './producer.entity';
import { RiceType } from './rice-type.entity';
import { Expose } from 'class-transformer';
import { Template } from './template.entity';
import { ReceptionHistory } from '../interfaces/reception-history.interface';

export type ReceptionStatus = 'pending' | 'settled' | 'canceled';

// ... (importaciones iguales)

@Entity('reception')
export class Reception {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @ManyToOne(() => Season, { nullable: true })
  season: Season;

  @ManyToOne(() => Producer)
  @JoinColumn({ name: 'producerId' })
  @Expose()
  producer: Producer;

  @Column()
  @Expose()
  producerId: number;

  @ManyToOne(() => RiceType)
  @JoinColumn({ name: 'riceTypeId' })
  @Expose()
  riceType: RiceType;

  @Column()
  @Expose()
  riceTypeId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @Expose()
  price: number;

  @Column({ length: 100 })
  @Expose()
  guide: string;

  @Column({ length: 20 })
  @Expose()
  licensePlate: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @Expose()
  grossWeight: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
  })
  @Expose()
  tare: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @Expose()
  netWeight: number;

  // 🧪 Análisis de granos (percent + tolerance)
  @Column('float', { default: 0 })
  @Expose()
  percentHumedad: number;

  @Column('float', { default: 0 })
  @Expose()
  toleranceHumedad: number;

  @Column('float', { default: 0 })
  @Expose()
  percentGranosVerdes: number;

  @Column('float', { default: 0 })
  @Expose()
  toleranceGranosVerdes: number;

  @Column('float', { default: 0 })
  @Expose()
  percentImpurezas: number;

  @Column('float', { default: 0 })
  @Expose()
  toleranceImpurezas: number;

  @Column('float', { default: 0 })
  @Expose()
  percentGranosManchados: number;

  @Column('float', { default: 0 })
  @Expose()
  toleranceGranosManchados: number;

  @Column('float', { default: 0 })
  @Expose()
  percentHualcacho: number;

  @Column('float', { default: 0 })
  @Expose()
  toleranceHualcacho: number;

  @Column('float', { default: 0 })
  @Expose()
  percentGranosPelados: number;

  @Column('float', { default: 0 })
  @Expose()
  toleranceGranosPelados: number;

  @Column('float', { default: 0 })
  @Expose()
  percentGranosYesosos: number;

  @Column('float', { default: 0 })
  @Expose()
  toleranceGranosYesosos: number;

  // Nuevo: Vano
  @Column('float', { default: 0 })
  @Expose()
  percentVano: number;

  @Column('float', { default: 0 })
  @Expose()
  toleranceVano: number;

  // ➕ Bonificación (solo tolerancia)
  @Column('float', { default: 0 })
  @Expose()
  toleranceBonificacion: number;

  // 🌡 Secado (solo percent)
  @Column('float', { default: 0 })
  @Expose()
  percentSecado: number;

  // 💰 Cálculos derivados (en Kg)
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @Expose()
  totalDiscount: number; // Kg de descuento total aplicado

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @Expose()
  bonus: number; // Kg de bonificación obtenida

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @Expose()
  paddyNet: number; // Kg netos de arroz a pagar al productor

  // �📝 Nota u observación del usuario
  @Column('text', { nullable: true })
  @Expose()
  note?: string;

  // 📌 Estado de la recepción
  @Column({
    type: 'enum',
    enum: ['pending', 'settled', 'canceled'],
    default: 'pending',
  })
  @Expose()
  status: ReceptionStatus;

  @ManyToOne(() => Template, { nullable: true , onDelete: 'SET NULL' })
  @JoinColumn({ name: 'templateId' })
  @Expose()
  template: Template;

  @Column({ nullable: true })
  @Expose()
  templateId: number;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;

  // Historial de cambios de la recepción en formato JSON
  @Column('json', { nullable: true })
  @Expose()
  historyLog: ReceptionHistory;
}
