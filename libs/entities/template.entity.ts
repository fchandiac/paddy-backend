import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Producer } from './producer.entity';
import { Exclude } from 'class-transformer';
import { Reception } from './reception.entity';

@Entity('template')
export class Template {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'boolean', default: false })
  useToleranceGroup: boolean;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  groupToleranceValue: number;

  // Relación con Producer
  @ManyToOne(() => Producer, (producer) => producer.templates, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'producerId' })
  producer: Producer;


  @Column({ type: 'int', nullable: true })
  producerId: number;

  // Relación von Reception
  @OneToMany(() => Reception, (reception) => reception.template)
  receptions: Reception[];

  // --- Humedad ---
  @Column({ type: 'boolean', default: true })
  availableHumedad: boolean;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  percentHumedad: number;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  toleranceHumedad: number;

  @Column({ type: 'boolean', nullable: true })
  showToleranceHumedad: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  groupToleranceHumedad: boolean | null;

  // --- Granos Verdes ---
  @Column({ type: 'boolean', default: true })
  availableGranosVerdes: boolean;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  percentGranosVerdes: number;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  toleranceGranosVerdes: number;

  @Column({ type: 'boolean', nullable: true })
  showToleranceGranosVerdes: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  groupToleranceGranosVerdes: boolean | null;

  // --- Impurezas ---
  @Column({ type: 'boolean', default: true })
  availableImpurezas: boolean;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  percentImpurezas: number;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  toleranceImpurezas: number;

  @Column({ type: 'boolean', nullable: true })
  showToleranceImpurezas: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  groupToleranceImpurezas: boolean | null;

  // --- Granos Manchados ---
  @Column({ type: 'boolean', default: true })
  availableGranosManchados: boolean;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  percentGranosManchados: number;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  toleranceGranosManchados: number;

  @Column({ type: 'boolean', nullable: true })
  showToleranceGranosManchados: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  groupToleranceGranosManchados: boolean | null;

  // --- Hualcacho ---
  @Column({ type: 'boolean', default: true })
  availableHualcacho: boolean;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  percentHualcacho: number;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  toleranceHualcacho: number;

  @Column({ type: 'boolean', nullable: true })
  showToleranceHualcacho: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  groupToleranceHualcacho: boolean | null;

  // --- Granos Pelados ---
  @Column({ type: 'boolean', default: true })
  availableGranosPelados: boolean;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  percentGranosPelados: number;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  toleranceGranosPelados: number;

  @Column({ type: 'boolean', nullable: true })
  showToleranceGranosPelados: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  groupToleranceGranosPelados: boolean | null;

  // --- Granos Yesosos ---
  @Column({ type: 'boolean', default: true })
  availableGranosYesosos: boolean;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  percentGranosYesosos: number;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  toleranceGranosYesosos: number;

  @Column({ type: 'boolean', nullable: true })
  showToleranceGranosYesosos: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  groupToleranceGranosYesosos: boolean | null;

  // --- Vano ---
  @Column({ type: 'boolean', default: true })
  availableVano: boolean;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  percentVano: number;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  toleranceVano: number;

  @Column({ type: 'boolean', nullable: true })
  showToleranceVano: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  groupToleranceVano: boolean | null;

  // --- Bonificación ---
  @Column({ type: 'boolean', default: true })
  availableBonus: boolean;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  toleranceBonus: number;

  // --- Secado ---
  @Column({ type: 'boolean', default: true })
  availableDry: boolean;

  @Column({ type: 'float', precision: 5, scale: 2, default: 0 })
  percentDry: number;

  @Column({ type: 'boolean', default: false })
  default: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  @Exclude()
  deletedAt: Date;
}
