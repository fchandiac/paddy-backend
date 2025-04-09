import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { RiceType } from './rice-type.entity';
import { Producer } from './producer.entity';

@Entity()
export class RicePrice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RiceType, (riceType) => riceType.id)
  riceType: RiceType;

  @ManyToOne(() => Producer, (producer) => producer.id)
  producer: Producer;

  @Column('decimal')
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
