import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('analysis_param')
export class AnalysisParam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  discountCode: number; // Ahora es un number simple

  @Column('decimal', { precision: 5, scale: 2 })
  start: number;

  @Column('decimal', { precision: 5, scale: 2 })
  end: number;

  @Column('decimal', { precision: 5, scale: 2 })
  percent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
