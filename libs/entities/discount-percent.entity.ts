import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class DiscountPercent {
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
