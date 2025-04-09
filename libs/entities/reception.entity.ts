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

export type ReceptionStatus = 'pending' | 'settled' | 'canceled';

@Entity('reception')
export class Reception {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

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

  @Column('decimal', { precision: 10, scale: 2 })
  @Expose()
  tare: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @Expose()
  netWeight: number;

  // 🧪 Análisis de granos
  @Column('decimal', { precision: 5, scale: 2 })
  @Expose()
  humedad: number;

  @Column('decimal', { precision: 5, scale: 2 })
  @Expose()
  granosVerdes: number;

  @Column('decimal', { precision: 5, scale: 2 })
  @Expose()
  impurezas: number;

  @Column('decimal', { precision: 5, scale: 2 })
  @Expose()
  granosManchados: number;

  @Column('decimal', { precision: 5, scale: 2 })
  @Expose()
  hualcacho: number;

  @Column('decimal', { precision: 5, scale: 2 })
  @Expose()
  granosPelados: number;

  @Column('decimal', { precision: 5, scale: 2 })
  @Expose()
  granosYesosos: number;

  // ➕ Bonificación
  @Column('decimal', { precision: 5, scale: 2 })
  @Expose()
  bonificacion: number;

  // 🌡 Secado (independiente)
  @Column('decimal', { precision: 5, scale: 2 })
  @Expose()
  secado: number;

  // 📌 Estado de la recepción
  @Column({ type: 'enum', enum: ['pending', 'settled', 'canceled'], default: 'pending' })
  @Expose()
  status: ReceptionStatus;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;
}


